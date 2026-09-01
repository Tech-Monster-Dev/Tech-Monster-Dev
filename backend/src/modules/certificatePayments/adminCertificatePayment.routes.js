import express from "express";

import {
    protect,
} from "../../core/security/auth.middleware.js";

import authorizeRoles from "../../core/security/role.middleware.js";

import {
    getPendingPayments,
    getPaymentDetails,
    approvePayment,
    rejectPayment,
} from "./adminCertificatePayment.controller.js";


const router = express.Router();


router.get(
    "/pending",
    protect,
    authorizeRoles("admin"),
    getPendingPayments
);


router.get(
    "/:id",
    protect,
    authorizeRoles("admin"),
    getPaymentDetails
);


router.patch(
    "/:id/approve",
    protect,
    authorizeRoles("admin"),
    approvePayment
);


router.patch(
    "/:id/reject",
    protect,
    authorizeRoles("admin"),
    rejectPayment
);


export default router;
