import express from "express";

import {
    protect,
} from "../../core/security/auth.middleware.js";

import {
    createPayment,
    verifyPayment,
    verifyQRPayment,
    getMyPayment,
} from "./certificatePayment.controller.js";


const router =
    express.Router();


/*
 * ==========================================
 * CREATE CERTIFICATE PAYMENT
 * ==========================================
 */
router.post(
    "/create",
    protect,
    createPayment
);


/*
 * ==========================================
 * VERIFY CERTIFICATE PAYMENT
 * ==========================================
 *
 * Used after Razorpay confirms the payment.
 */
router.post(
    "/verify",
    protect,
    verifyPayment
);


/*
 * ==========================================
 * VERIFY RAZORPAY QR PAYMENT
 * ==========================================
 */
router.post(
    "/verify-qr",
    protect,
    verifyQRPayment
);


/*
 * ==========================================
 * GET MY PAYMENT STATUS
 * ==========================================
 */
router.get(
    "/my",
    protect,
    getMyPayment
);


export default router;
