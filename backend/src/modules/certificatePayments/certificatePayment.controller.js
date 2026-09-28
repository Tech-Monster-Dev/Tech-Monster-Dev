import asyncHandler from "../../core/http/asyncHandler.js";
import AppError from "../../core/errors/AppError.js";

import {
    createCertificatePayment,
    submitCertificatePayment,
    cancelCertificatePayment,
} from "./certificatePayment.service.js";

import CertificatePayment from "./models/CertificatePayment.js";

/*
 * ==========================================
 * CREATE CERTIFICATE PAYMENT ORDER
 * ==========================================
 *
 * The frontend sends only the completed
 * program identifier.
 *
 * The backend resolves:
 * - student eligibility
 * - program type
 * - program title
 * - certificate availability
 * - exact admin-configured price
 *
 * The client cannot choose or modify the
 * payment amount.
*/
export const createPayment = asyncHandler(async (req, res) => {
    const {
        courseId = null,
        internshipId = null,
    } = req.body || {};

    if (
        (!courseId && !internshipId) ||
        (courseId && internshipId)
    ) {
        throw new AppError(
            "Provide exactly one courseId or internshipId.",
            400
        );
    }

    const result = await createCertificatePayment(
        req.user._id,
        {
            courseId,
            internshipId,
        }
    );

    const {
        payment,
        reused,
    } = result;

    return res.status(
        reused ? 200 : 201
    ).json({
        success: true,
        message:
            reused
                ? "Existing certificate payment found."
                : "Certificate payment session created successfully.",

        payment: {
            id: payment._id,
            programType: payment.programType,
            programTitle: payment.programTitle,
            amount: payment.amount,
            currency: payment.currency,
            status: payment.status,
            gateway: payment.gateway,
            expiresAt: payment.expiresAt,
        },

        reused: Boolean(reused),
    });
});

/*
 * ==========================================
 * CANCEL CERTIFICATE PAYMENT
 * ==========================================
 *
 * Only an unpaid certificate payment session
 * can be cancelled by the authenticated student.
*/
export const cancelPayment = asyncHandler(async (req, res) => {
    const {
        paymentId,
        payerName,
        transactionId,
    } = req.body || {};

    if (!paymentId) {
        throw new AppError(
            "Payment ID is required.",
            400
        );
    }

    const result = await cancelCertificatePayment(
        req.user._id,
        paymentId
    );

    return res.status(200).json({
        success: true,
        message: "Certificate payment session cancelled successfully.",
        ...result,
    });
});

/*
 * ==========================================
 * SUBMIT CERTIFICATE PAYMENT
 * ==========================================
 *
 * The student confirms that the manual UPI
 * payment has been completed.
 *
 * The backend keeps the payment amount from
 * the database and moves the payment to
 * admin approval. The certificate is NOT
 * issued automatically.
*/
export const submitPayment = asyncHandler(async (req, res) => {
    const {
        paymentId,
        payerName,
        transactionId,
    } = req.body || {};

    if (!paymentId) {
        throw new AppError(
            "Payment ID is required.",
            400
        );
    }

    const payment = await submitCertificatePayment(
        req.user._id,
        paymentId,
        payerName,
        transactionId
    );

    return res.status(200).json({
        success: true,
        message: "Payment submitted successfully. Waiting for admin approval.",
        payment: {
            id: payment._id,
            programType: payment.programType,
            programTitle: payment.programTitle,
            amount: payment.amount,
            currency: payment.currency,
            status: payment.status,
            payerName: payment.payerName,
            transactionId: payment.transactionId,
            paidAt: payment.paidAt,
            expiresAt: payment.expiresAt,
        },
    });
});

/*
 * ==========================================
 * GET MY CERTIFICATE PAYMENT STATUS
 * ==========================================
 *
 * Used by the student certificate page after
 * payment creation or page refresh.
 *
 * Only the authenticated student's own
 * payment records can be returned.
*/
export const getMyPayment = asyncHandler(async (req, res) => {
    const {
        courseId = null,
        internshipId = null,
    } = req.query || {};

    if (
        (!courseId && !internshipId) ||
        (courseId && internshipId)
    ) {
        throw new AppError(
            "Provide exactly one courseId or internshipId.",
            400
        );
    }

    const query = {
        student: req.user._id,
        ...(courseId
            ? {
                course: courseId,
                internship: null,
            }
            : {
                course: null,
                internship: internshipId,
            }),
    };

    const payment = await CertificatePayment.findOne(
        query
    ).sort({
        createdAt: -1,
    });

    if (!payment) {
        return res.status(200).json({
            success: true,
            payment: null,
        });
    }

    /*
     * Expired checkout should no longer be
     * presented as an active payment.
    */
    if (
        [
            "created",
            "pending",
        ].includes(
            payment.status
        ) &&
        payment.expiresAt &&
        payment.expiresAt <=
        new Date()
    ) {
        payment.status = "expired";
        await payment.save();
    }

    return res.status(200).json({
        success: true,
        payment: {
            id: payment._id,
            programType: payment.programType,
            programTitle: payment.programTitle,
            amount: payment.amount,
            currency: payment.currency,
            status: payment.status,
            gateway: payment.gateway,
            payerName: payment.payerName,
            transactionId: payment.transactionId,
            paidAt: payment.paidAt,
            expiresAt: payment.expiresAt,
            rejectionReason: payment.rejectionReason,
        },
    });
});