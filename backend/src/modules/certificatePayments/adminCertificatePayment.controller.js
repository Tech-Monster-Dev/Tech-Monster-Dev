import asyncHandler from "../../core/http/asyncHandler.js";
import AppError from "../../core/errors/AppError.js";
import StudentInternship from "../internships/models/StudentInternship.js";

import {
    getPendingCertificatePayments,
    getIssuedCertificatesByStudent,
    approveCertificatePayment,
    rejectCertificatePayment,
} from "./services/certificatePaymentApproval.service.js";

/*
 * ==========================================
 * GET PENDING CERTIFICATE PAYMENTS
 * ==========================================
*/
export const getPendingPayments = asyncHandler(async (req, res) => {
    const payments = await getPendingCertificatePayments();
    return res.status(200).json({
        success: true,
        total: payments.length,
        payments,
    });
});

/*
 * ==========================================
 * GET ISSUED CERTIFICATES BY STUDENT
 * ==========================================
*/
export const getIssuedCertificates = asyncHandler(async (req, res) => {
    const students = await getIssuedCertificatesByStudent();

    return res.status(200).json({
        success: true,
        total: students.length,
        students,
    });
});

/*
 * ==========================================
 * GET CERTIFICATE PAYMENT DETAILS
 * ==========================================
*/
export const getPaymentDetails = asyncHandler(async (req, res) => {
    const CertificatePayment = (await import(
        "./models/CertificatePayment.js"
    )).default;

    const payment = await CertificatePayment.findById(
        req.params.id
    )
        .populate(
            "student",
            "firstName middleName lastName username email avatar"
        )
        .populate(
            "course",
            "title slug category duration price"
        )
        .populate(
            "internship",
            "title slug category duration price"
        )
        .populate(
            "reviewedBy",
            "firstName lastName username"
        )
        .populate(
            "certificate"
        );

    if (!payment) {
        throw new AppError(
            "Certificate payment not found.",
            404
        );
    }

    const enrollment = await StudentInternship.findOne({
        student: payment.student?._id || payment.student,
        ...(payment.programType === "course"
            ? { course: payment.course?._id || payment.course }
            : { internship: payment.internship?._id || payment.internship }),
        status: "Completed",
    }).select("completedAt");

    return res.status(200).json({
        success: true,
        payment,
        completionDate: enrollment?.completedAt || null,
    });
});

/*
 * ==========================================
 * APPROVE CERTIFICATE PAYMENT
 * ==========================================
*/
export const approvePayment = asyncHandler(async (req, res) => {
    const result = await approveCertificatePayment(
        req.params.id,
        req.user._id,
        req.file?.buffer
    );

    return res.status(200).json({
        success: true,
        message: "Certificate payment approved and certificate issued successfully.",
        payment: result.payment,
        certificate: result.certificate,
    });
});

/*
 * ==========================================
 * REJECT CERTIFICATE PAYMENT
 * ==========================================
*/
export const rejectPayment = asyncHandler(async (req, res) => {
    const {
        rejectionReason,
    } = req.body || {};

    if (
        !String(
            rejectionReason || ""
        ).trim()
    ) {
        throw new AppError(
            "Rejection reason is required.",
            400
        );
    }

    const payment = await rejectCertificatePayment(
        req.params.id,
        req.user._id,
        rejectionReason
    );

    return res.status(200).json({
        success: true,
        message: "Certificate payment rejected successfully.",
        payment,
    });
});