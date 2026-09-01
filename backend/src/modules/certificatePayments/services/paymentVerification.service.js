import crypto from "crypto";

import CertificatePayment from "../models/CertificatePayment.js";

import {
    fetchRazorpayPayment,
    fetchRazorpayQRPayments,
} from "./razorpay.service.js";

import AppError from "../../../core/errors/AppError.js";


/*
 * ==========================================
 * VERIFY RAZORPAY PAYMENT
 * ==========================================
 *
 * IMPORTANT:
 *
 * The browser must NEVER be trusted to say
 * that a payment succeeded.
 *
 * Verification happens on the backend using:
 *
 * 1. Razorpay order ID
 * 2. Razorpay payment ID
 * 3. Razorpay signature
 * 4. Server-side Razorpay payment details
 * 5. Expected database amount
 *
 * Only after every validation succeeds is the
 * payment moved to approval_pending.
 */


/*
 * ==========================================
 * VERIFY RAZORPAY QR PAYMENT
 * ==========================================
 *
 * The student scans the Dynamic Razorpay QR
 * using any supported UPI application.
 *
 * The backend fetches payments directly from
 * Razorpay using the stored QR ID.
 */
export const verifyRazorpayQRPayment =
    async ({
        studentId,
        paymentId,
    }) => {

        if (!studentId || !paymentId) {
            throw new AppError(
                "Payment verification details are incomplete.",
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
            [
                "paid",
                "approval_pending",
                "approved",
            ].includes(payment.status)
        ) {
            return payment;
        }

        if (!payment.qrCodeId) {
            throw new AppError(
                "Payment QR code is not configured.",
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
                "This payment QR has expired. Please create a new payment.",
                410
            );
        }

        const result =
            await fetchRazorpayQRPayments(
                payment.qrCodeId,
                {
                    count: 100,
                }
            );

        const payments =
            Array.isArray(result?.items)
                ? result.items
                : [];

        const expectedAmountPaise =
            Math.round(
                Number(payment.amount) * 100
            );

        const matchedPayment =
            payments.find((gatewayPayment) =>
                gatewayPayment.status === "captured" &&
                Number(gatewayPayment.amount) ===
                    expectedAmountPaise &&
                String(
                    gatewayPayment.currency || ""
                ).toUpperCase() ===
                    String(
                        payment.currency || "INR"
                    ).toUpperCase()
            );

        if (!matchedPayment) {
            return null;
        }

        payment.gatewayPaymentId =
            String(matchedPayment.id);

        payment.transactionId =
            String(matchedPayment.id);

        payment.paidAt =
            matchedPayment.created_at
                ? new Date(
                    matchedPayment.created_at * 1000
                )
                : new Date();

        payment.status =
            "approval_pending";

        await payment.save();

        return payment;
    };


/*
 * ==========================================
 * SIGNATURE VERIFICATION
 * ==========================================
 */
const verifySignature = ({
    orderId,
    paymentId,
    signature,
}) => {

    const secret =
        String(
            process.env.RAZORPAY_KEY_SECRET || ""
        ).trim();


    if (!secret) {
        throw new AppError(
            "Payment gateway is not configured.",
            503
        );
    }


    if (
        !orderId ||
        !paymentId ||
        !signature
    ) {
        return false;
    }


    const generatedSignature =
        crypto
            .createHmac(
                "sha256",
                secret
            )
            .update(
                `${orderId}|${paymentId}`
            )
            .digest("hex");


    return crypto.timingSafeEqual(
        Buffer.from(
            generatedSignature,
            "utf8"
        ),
        Buffer.from(
            String(signature),
            "utf8"
        )
    );
};


/*
 * ==========================================
 * VERIFY CERTIFICATE PAYMENT
 * ==========================================
 */
export const verifyCertificatePayment =
    async ({
        studentId,
        paymentId,
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
    }) => {

        if (
            !studentId ||
            !paymentId ||
            !razorpayOrderId ||
            !razorpayPaymentId ||
            !razorpaySignature
        ) {
            throw new AppError(
                "Payment verification details are incomplete.",
                400
            );
        }


        const payment =
            await CertificatePayment.findOne({
                _id:
                    paymentId,

                student:
                    studentId,
            });


        if (!payment) {
            throw new AppError(
                "Certificate payment not found.",
                404
            );
        }


        /*
         * ==========================================
         * IDEMPOTENCY
         * ==========================================
         *
         * A successful payment must not be
         * processed twice.
         */
        if (
            [
                "paid",
                "approval_pending",
                "approved",
            ].includes(
                payment.status
            )
        ) {
            return payment;
        }


        /*
         * ==========================================
         * EXPIRY CHECK
         * ==========================================
         */
        if (
            payment.expiresAt &&
            payment.expiresAt <=
            new Date()
        ) {

            payment.status =
                "expired";

            await payment.save();


            throw new AppError(
                "This payment session has expired. Please create a new payment.",
                410
            );
        }


        /*
         * ==========================================
         * ORDER ID MATCH
         * ==========================================
         */
        if (
            String(
                payment.gatewayOrderId
            ) !==
            String(
                razorpayOrderId
            )
        ) {
            throw new AppError(
                "Payment order mismatch.",
                400
            );
        }


        /*
         * ==========================================
         * SIGNATURE MATCH
         * ==========================================
         */
        const signatureValid =
            verifySignature({
                orderId:
                    razorpayOrderId,

                paymentId:
                    razorpayPaymentId,

                signature:
                    razorpaySignature,
            });


        if (!signatureValid) {
            throw new AppError(
                "Payment signature verification failed.",
                400
            );
        }


        /*
         * ==========================================
         * FETCH PAYMENT FROM RAZORPAY
         * ==========================================
         *
         * This is another server-side check.
         */
        const gatewayPayment =
            await fetchRazorpayPayment(
                razorpayPaymentId
            );


        if (!gatewayPayment) {
            throw new AppError(
                "Unable to verify payment with payment gateway.",
                502
            );
        }


        /*
         * ==========================================
         * GATEWAY ORDER MATCH
         * ==========================================
         */
        if (
            String(
                gatewayPayment.order_id
            ) !==
            String(
                payment.gatewayOrderId
            )
        ) {
            throw new AppError(
                "Gateway order verification failed.",
                400
            );
        }


        /*
         * ==========================================
         * PAYMENT AMOUNT MATCH
         * ==========================================
         *
         * Razorpay returns amount in paise.
         *
         * Database stores amount in INR.
         */
        const expectedAmountPaise =
            Math.round(
                Number(
                    payment.amount
                ) * 100
            );


        if (
            Number(
                gatewayPayment.amount
            ) !==
            expectedAmountPaise
        ) {
            throw new AppError(
                "Payment amount mismatch.",
                400
            );
        }


        /*
         * ==========================================
         * CURRENCY MATCH
         * ==========================================
         */
        if (
            String(
                gatewayPayment.currency ||
                ""
            ).toUpperCase() !==
            String(
                payment.currency ||
                "INR"
            ).toUpperCase()
        ) {
            throw new AppError(
                "Payment currency mismatch.",
                400
            );
        }


        /*
         * ==========================================
         * PAYMENT STATUS
         * ==========================================
         *
         * Only a captured payment can proceed
         * to certificate approval.
         */
        if (
            gatewayPayment.status !==
            "captured"
        ) {

            if (
                [
                    "failed",
                ].includes(
                    gatewayPayment.status
                )
            ) {
                payment.status =
                    "payment_failed";

                await payment.save();
            }


            throw new AppError(
                `Payment is not captured. Current gateway status: ${gatewayPayment.status || "unknown"}.`,
                400
            );
        }


        /*
         * ==========================================
         * SAVE VERIFIED PAYMENT
         * ==========================================
         */
        payment.gatewayPaymentId =
            String(
                razorpayPaymentId
            );

        payment.gatewaySignature =
            String(
                razorpaySignature
            );

        payment.transactionId =
            String(
                razorpayPaymentId
            );

        payment.paidAt =
            new Date();

        payment.status =
            "approval_pending";


        await payment.save();


        return payment;
    };
