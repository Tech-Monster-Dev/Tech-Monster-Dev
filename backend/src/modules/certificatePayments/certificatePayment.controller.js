import asyncHandler from "../../core/http/asyncHandler.js";
import AppError from "../../core/errors/AppError.js";

import {
    createCertificatePayment,
} from "./certificatePayment.service.js";

import {
    verifyCertificatePayment,
    verifyRazorpayQRPayment,
} from "./services/paymentVerification.service.js";

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
export const createPayment =
    asyncHandler(async (req, res) => {

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


        const result =
            await createCertificatePayment(
                req.user._id,
                {
                    courseId,
                    internshipId,
                }
            );


        const {
            payment,
            order,
            qrCode,
            reused,
        } = result;


        return res.status(
            reused ? 200 : 201
        ).json({
            success: true,

            message:
                reused
                    ? "Existing certificate payment found."
                    : "Certificate payment order created successfully.",

            payment: {
                id:
                    payment._id,

                programType:
                    payment.programType,

                programTitle:
                    payment.programTitle,

                amount:
                    payment.amount,

                currency:
                    payment.currency,

                status:
                    payment.status,

                gateway:
                    payment.gateway,

                gatewayOrderId:
                    payment.gatewayOrderId,

                expiresAt:
                    payment.expiresAt,
            },

            order: order
                ? {
                    id:
                        order.id,

                    amount:
                        order.amount,

                    currency:
                        order.currency,

                    receipt:
                        order.receipt,
                }
                : null,

            qrCode: qrCode
                ? {
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
                }
                : null,

            reused:
                Boolean(reused),
        });
    });


/*
 * ==========================================
 * VERIFY CERTIFICATE PAYMENT
 * ==========================================
 *
 * Razorpay sends payment identifiers to the
 * frontend after successful checkout.
 *
 * The backend independently verifies:
 *
 * - authenticated student
 * - payment record
 * - order ID
 * - signature
 * - gateway payment
 * - gateway order
 * - amount
 * - currency
 * - captured status
 *
 * A verified payment becomes:
 *
 * approval_pending
 *
 * It is NOT automatically approved.
 */
export const verifyPayment =
    asyncHandler(async (req, res) => {

        const {
            paymentId,
            razorpayOrderId,
            razorpayPaymentId,
            razorpaySignature,
        } = req.body || {};


        const payment =
            await verifyCertificatePayment({
                studentId:
                    req.user._id,

                paymentId,

                razorpayOrderId,

                razorpayPaymentId,

                razorpaySignature,
            });


        return res.status(200).json({

            success: true,

            message:
                "Payment verified successfully. Waiting for admin approval.",

            payment: {
                id:
                    payment._id,

                programType:
                    payment.programType,

                programTitle:
                    payment.programTitle,

                amount:
                    payment.amount,

                currency:
                    payment.currency,

                status:
                    payment.status,

                transactionId:
                    payment.transactionId,

                paidAt:
                    payment.paidAt,

                expiresAt:
                    payment.expiresAt,
            },

        });
    });


/*
 * ==========================================
 * VERIFY RAZORPAY QR PAYMENT
 * ==========================================
 *
 * The backend checks Razorpay directly using
 * the QR ID stored against this payment.
 *
 * The frontend does NOT provide:
 * - amount
 * - transaction ID
 * - payment status
 *
 * Those values come from Razorpay.
 */
export const verifyQRPayment =
    asyncHandler(async (req, res) => {

        const {
            paymentId,
        } = req.body || {};

        if (!paymentId) {
            throw new AppError(
                "Payment ID is required.",
                400
            );
        }

        const payment =
            await verifyRazorpayQRPayment({
                studentId:
                    req.user._id,

                paymentId,
            });

        if (!payment) {
            return res.status(200).json({
                success: true,

                paid: false,

                message:
                    "Payment has not been captured yet.",
            });
        }

        return res.status(200).json({
            success: true,

            paid: true,

            message:
                "Payment verified successfully. Waiting for admin approval.",

            payment: {
                id:
                    payment._id,

                programType:
                    payment.programType,

                programTitle:
                    payment.programTitle,

                amount:
                    payment.amount,

                currency:
                    payment.currency,

                status:
                    payment.status,

                transactionId:
                    payment.transactionId,

                paidAt:
                    payment.paidAt,

                expiresAt:
                    payment.expiresAt,
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
export const getMyPayment =
    asyncHandler(async (req, res) => {

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
            student:
                req.user._id,

            ...(courseId
                ? {
                    course:
                        courseId,
                    internship:
                        null,
                }
                : {
                    course:
                        null,
                    internship:
                        internshipId,
                }),
        };


        const payment =
            await CertificatePayment.findOne(
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

            payment.status =
                "expired";

            await payment.save();
        }


        return res.status(200).json({

            success: true,

            payment: {
                id:
                    payment._id,

                programType:
                    payment.programType,

                programTitle:
                    payment.programTitle,

                amount:
                    payment.amount,

                currency:
                    payment.currency,

                status:
                    payment.status,

                gateway:
                    payment.gateway,

                gatewayOrderId:
                    payment.gatewayOrderId,

                gatewayPaymentId:
                    payment.gatewayPaymentId,

                transactionId:
                    payment.transactionId,

                paidAt:
                    payment.paidAt,

                expiresAt:
                    payment.expiresAt,

                rejectionReason:
                    payment.rejectionReason,
            },

        });
    });
