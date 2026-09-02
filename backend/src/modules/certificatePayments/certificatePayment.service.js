import CertificatePayment from "./models/CertificatePayment.js";

import Course from "../courses/models/Course.js";
import Internship from "../internships/models/Internship.js";
import StudentInternship from "../internships/models/StudentInternship.js";

import AppError from "../../core/errors/AppError.js";

import {
    createRazorpayOrder,
    createRazorpayQRCode,
    closeRazorpayQRCode,
    isRazorpayConfigured,
} from "./services/razorpay.service.js";


const PAYMENT_WINDOW_MS =
    15 * 60 * 1000;


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
export const getCompletedProgramForStudent =
    async (studentId, {
        courseId = null,
        internshipId = null,
    } = {}) => {

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

            const enrollment =
                await StudentInternship.findOne({
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

                programId:
                    enrollment.course._id,

                programTitle:
                    enrollment.course.title,

                amount:
                    Number(
                        enrollment.course.price
                    ),

                course:
                    enrollment.course,

                internship:
                    null,
            };
        }


        const enrollment =
            await StudentInternship.findOne({
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

            programId:
                enrollment.internship._id,

            programTitle:
                enrollment.internship.title,

            amount:
                Number(
                    enrollment.internship.price
                ),

            course:
                null,

            internship:
                enrollment.internship,
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
export const cancelCertificatePayment =
    async (
        studentId,
        paymentId
    ) => {

        if (!studentId || !paymentId) {
            throw new AppError(
                "Payment cancellation details are incomplete.",
                400
            );
        }

        const payment =
            await CertificatePayment.findOne({
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

        if (payment.qrCodeId) {
            try {
                await closeRazorpayQRCode(
                    payment.qrCodeId
                );
            } catch (error) {
                console.error(
                    "Failed to close Razorpay QR code:",
                    error
                );
            }
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
 * CREATE CERTIFICATE PAYMENT
 * ==========================================
 */
export const createCertificatePayment =
    async (
        studentId,
        {
            courseId = null,
            internshipId = null,
        } = {}
    ) => {

        if (!isRazorpayConfigured()) {
            throw new AppError(
                "Certificate payment gateway is not configured.",
                503
            );
        }


        const program =
            await getCompletedProgramForStudent(
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
        const existingPayment =
            await CertificatePayment.findOne({
                student: studentId,

                ...(program.programType === "course"
                    ? {
                        course:
                            program.programId,
                        internship: null,
                    }
                    : {
                        course: null,
                        internship:
                            program.programId,
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
                    payment:
                        existingPayment,

                    reused:
                        true,
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
                let qrCode = null;

                if (existingPayment.qrCodeData) {
                    try {
                        qrCode = JSON.parse(existingPayment.qrCodeData);
                    } catch (error) {
                        console.error(
                            "Failed to parse stored certificate QR data:",
                            error
                        );
                    }
                }

                return {
                    payment:
                        existingPayment,

                    qrCode,

                    reused:
                        true,
                };
            }


            /*
             * Expired checkout is no longer usable.
             */
            existingPayment.status =
                "expired";

            await existingPayment.save();
        }


        const expiresAt =
            new Date(
                Date.now() +
                PAYMENT_WINDOW_MS
            );


        const receipt =
            `TM-CERT-${String(
                studentId
            ).slice(-8)}-${Date.now()}`;


        const order =
            await createRazorpayOrder({
                amount:
                    program.amount,

                currency:
                    "INR",

                receipt,

                notes: {
                    studentId:
                        String(studentId),

                    programType:
                        program.programType,

                    programId:
                        String(
                            program.programId
                        ),

                    purpose:
                        "certificate",
                },
            });


        /*
         * ==========================================
         * CREATE DYNAMIC UPI QR
         * ==========================================
         *
         * The QR is generated by Razorpay.
         *
         * The amount is NOT received from the
         * frontend. It comes from the verified
         * database program price above.
         *
         * close_by is the gateway-side expiry.
         * The QR therefore stops being usable
         * after the same 10-minute payment window.
         */
        const closeBy =
            Math.floor(
                expiresAt.getTime() / 1000
            );


        const qrCode =
            await createRazorpayQRCode({

                amount:
                    program.amount,

                description:
                    `Certificate payment - ${program.programTitle}`,

                closeBy,

                notes: {
                    studentId:
                        String(studentId),

                    programType:
                        program.programType,

                    programId:
                        String(
                            program.programId
                        ),

                    razorpayOrderId:
                        String(order.id),

                    purpose:
                        "certificate",
                },

            });


        /*
         * ==========================================
         * SAVE PAYMENT + QR DATA
         * ==========================================
         *
         * Razorpay returns the QR image URL/data.
         *
         * Store the complete response reference
         * required by the frontend.
         */
        const payment =
            await CertificatePayment.create({

                student:
                    studentId,

                course:
                    program.course?._id ||
                    null,

                internship:
                    program.internship?._id ||
                    null,

                programType:
                    program.programType,

                programTitle:
                    program.programTitle,

                amount:
                    program.amount,

                currency:
                    "INR",

                gateway:
                    "razorpay",

                gatewayOrderId:
                    order.id,

                status:
                    "created",

                expiresAt,

                qrCodeId:
                    qrCode.id || "",

                qrCodeData:
                    JSON.stringify({
                        id:
                            qrCode.id || "",

                        imageUrl:
                            qrCode.image_url || "",

                        name:
                            qrCode.name || "",

                        usage:
                            qrCode.usage || "",

                        fixedAmount:
                            qrCode.fixed_amount,

                        paymentAmount:
                            qrCode.payment_amount,

                        closeBy:
                            qrCode.close_by,

                    }),

            });


        return {

            payment,

            order,

            qrCode,

            reused:
                false,

        };
    };
