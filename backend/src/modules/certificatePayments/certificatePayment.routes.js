import express from "express";

import {protect} from "../../core/security/auth.middleware.js";

import {
    createPayment,
    submitPayment,
    getMyPayment,
    cancelPayment,
} from "./certificatePayment.controller.js";

const router = express.Router();

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
 * SUBMIT CERTIFICATE PAYMENT
 * ==========================================
 *
 * Used after the student completes the
 * manual UPI QR payment.
*/
router.post(
    "/submit",
    protect,
    submitPayment
);

/*
 * ==========================================
 * CANCEL CERTIFICATE PAYMENT
 * ==========================================
*/
router.post(
    "/cancel",
    protect,
    cancelPayment
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