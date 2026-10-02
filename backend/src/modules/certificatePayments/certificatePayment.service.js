import CertificatePayment from "./models/CertificatePayment.js";

import Course from "../courses/models/Course.js";
import Internship from "../internships/models/Internship.js";
import StudentInternship from "../internships/models/StudentInternship.js";

import AppError from "../../core/errors/AppError.js";
import crypto from "crypto";
import { getNextCertificateNumber } from "../certificates/services/getNextCertificateNumber.js";

const PAYMENT_WINDOW_MS = 15 * 60 * 1000;

/*
 * ==========================================
 * GET COMPLETED PROGRAM
 * ==========================================
 *
 * A certificate payment can only be created
 * for a program the authenticated student has
 * actually completed.
 *
 * The amount is ALWAYS read from the database.
 * The frontend is never trusted for price.
*/
export const getCompletedProgramForStudent = async (studentId, { courseId = null, internshipId = null } = {}) => {
    if (
        (!courseId && !internshipId) ||
        (courseId && internshipId)
    ) {
        throw new AppError(
            "Exactly one course or internship is required.",
            400
        );
    }

    if (courseId) {
        const enrollment = await StudentInternship.findOne({
            student: studentId,
            course: courseId,
            status: "Completed",
        }).populate(
            "course"
        );


        if (!enrollment?.course) {
            throw new AppError(
                "Completed course enrollment not found.",
                404
            );
        }

        if (
            enrollment.course.certificate === false
        ) {
            throw new AppError(
                "Certificate is not available for this course.",
                400
            );
        }

        return {
            programType: "course",
            programId: enrollment.course._id,
            programTitle: enrollment.course.title,
            amount: Number(
                enrollment.course.price
            ),
            course: enrollment.course,
            internship: null,
        };
    }


    const enrollment = await StudentInternship.findOne({
        student: studentId,
        internship: internshipId,
        status: "Completed",
    }).populate(
        "internship"
    );


    if (!enrollment?.internship) {
        throw new AppError(
            "Completed internship enrollment not found.",
            404
        );
    }

    if (
        enrollment.internship.certificate === false
    ) {
        throw new AppError(
            "Certificate is not available for this internship.",
            400
        );
    }

    return {
        programType: "internship",
        programId: enrollment.internship._id,
        programTitle: enrollment.internship.title,
        amount: Number(
            enrollment.internship.price
        ),
        course: null,
        internship: enrollment.internship,
    };
};


/*
 * ==========================================
 * CANCEL CERTIFICATE PAYMENT
 * ==========================================
 *
 * Only an unpaid checkout can be cancelled.
 * Paid, approval-pending, approved, rejected,
 * and other completed payment records are never
 * deleted by this operation.
*/
export const cancelCertificatePayment = async (studentId, paymentId) => {
    if (!studentId || !paymentId) {
        throw new AppError(
            "Payment cancellation details are incomplete.",
            400
        );
    }

    const payment = await CertificatePayment.findOne({
        _id: paymentId,
        student: studentId,
    });

    if (!payment) {
        throw new AppError(
            "Certificate payment not found.",
            404
        );
    }

    if (
        ![
            "created",
            "pending",
        ].includes(payment.status)
    ) {
        throw new AppError(
            "Only an unpaid certificate payment can be cancelled.",
            400
        );
    }

    if (
        payment.expiresAt &&
        payment.expiresAt <= new Date()
    ) {
        payment.status = "expired";
        await payment.save();

        throw new AppError(
            "This payment session has already expired.",
            410
        );
    }

    await CertificatePayment.findByIdAndDelete(
        payment._id
    );

    return {
        cancelled: true,
        paymentId: payment._id,
    };
};

/*
 * ==========================================
 * SUBMIT CERTIFICATE PAYMENT
 * ==========================================
 *
 * The student confirms that the manual UPI
 * payment has been completed. The backend
 * does not trust a client-provided amount or
 * payment status. Admin approval is still
 * required before the certificate is issued.
 */
export const submitCertificatePayment = async (
    studentId,
    paymentId,
    payerName,
    transactionId
) => {
    if (
        !studentId ||
        !paymentId ||
        !payerName?.trim() ||
        !transactionId?.trim()
    ) {
        throw new AppError(
            "Payment submission details are incomplete.",
            400
        );
    }

    const payment = await CertificatePayment.findOne({
        _id: paymentId,
        student: studentId,
    });

    if (!payment) {
        throw new AppError(
            "Certificate payment not found.",
            404
        );
    }

    if (
        ![
            "created",
            "pending",
        ].includes(payment.status)
    ) {
        throw new AppError(
            "Only an unpaid certificate payment can be submitted.",
            400
        );
    }

    if (
        payment.expiresAt &&
        payment.expiresAt <= new Date()
    ) {
        payment.status = "expired";
        await payment.save();

        throw new AppError(
            "This payment session has already expired.",
            410
        );
    }

    const studentInternship = await StudentInternship.findOne({
        student: payment.student,
        ...(payment.programType === "course"
            ? { course: payment.course }
            : { internship: payment.internship }),
        status: "Completed",
    }).select("completedAt");

    if (studentInternship == null || !studentInternship.completedAt) {
        throw new AppError(
            "Program completion date is missing.",
            400
        );
    }

    const programWords = String(payment.programTitle || "")
        .trim()
        .split(/\s+/)
        .filter(Boolean);

    const programCode = programWords
        .slice(0, 2)
        .map((word) => word.charAt(0).toUpperCase())
        .join("");

    if (!programCode) {
        throw new AppError(
            "Program code could not be generated.",
            400
        );
    }

    const completionYear = new Date(
        studentInternship.completedAt
    ).getFullYear();

    const serial = await getNextCertificateNumber();
    const verificationToken = crypto.randomUUID();

    payment.verificationToken = verificationToken;
    payment.certificateNumber =
        `TM-${programCode}-${completionYear}-${serial}`;
    payment.payerName = payerName.trim();
    payment.transactionId = transactionId.trim();
    payment.status = "approval_pending";
    payment.paidAt = new Date();

    await payment.save();

    return payment;
};


/*
 * ==========================================
 * CREATE CERTIFICATE PAYMENT
 * ==========================================
*/
export const createCertificatePayment = async (studentId, { courseId = null, internshipId = null } = {}) => {
    const program = await getCompletedProgramForStudent(
        studentId,
        {
            courseId,
            internshipId,
        }
    );


    if (
        !Number.isFinite(
            program.amount
        ) ||
        program.amount <= 0
    ) {
        throw new AppError(
            "Invalid certificate payment amount configured for this program.",
            400
        );
    }

    /*
     * ==========================================
     * EXISTING PAYMENT CHECK
     * ==========================================
     *
     * Do not create duplicate payment orders
     * while an existing payment is still usable.
    */
    const existingPayment = await CertificatePayment.findOne({
        student: studentId,

        ...(program.programType === "course"
            ? {
                course: program.programId,
                internship: null,
            }
            : {
                course: null,
                internship: program.programId,
            }),

        status: {
            $in: [
                "created",
                "pending",
                "paid",
                "approval_pending",
                "approved",
            ],
        },
    }).sort({
        createdAt: -1,
    });


    if (existingPayment) {
        /*
         * Existing paid/approval states must
         * never create another payment.
        */
        if (
            [
                "paid",
                "approval_pending",
                "approved",
            ].includes(
                existingPayment.status
            )
        ) {
            return {
                payment: existingPayment,
                reused: true,
            };
        }

        /*
         * Reuse an unexpired checkout.
        */
        if (
            existingPayment.expiresAt &&
            existingPayment.expiresAt >
            new Date()
        ) {
            return {
                payment: existingPayment,
                reused: true,
            };
        }

        /*
         * Expired checkout is no longer usable.
        */
        existingPayment.status = "expired";

        await existingPayment.save();
    }

    const expiresAt = new Date(
        Date.now() +
        PAYMENT_WINDOW_MS
    );

    const payment = await CertificatePayment.create({
        student: studentId,
        course: program.course?._id || null,
        internship: program.internship?._id || null,
        programType: program.programType,
        programTitle: program.programTitle,
        amount: program.amount,
        currency: "INR",
        gateway: "manual_qr",
        status: "created",
        expiresAt,
    });
    return {
        payment,
        reused: false,
    };
};