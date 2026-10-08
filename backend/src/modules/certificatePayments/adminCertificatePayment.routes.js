import express from "express";

import {protect} from "../../core/security/auth.middleware.js";

import authorizeRoles from "../../core/security/role.middleware.js";
import upload from "../../infrastructure/storage/upload.middleware.js";
import {
    adminDownloadCertificate,
} from "../certificates/certificate.controller.js";

import {
    getPendingPayments,
    getIssuedCertificates,
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
    "/issued",
    protect,
    authorizeRoles("admin"),
    getIssuedCertificates
);

router.get(
    "/download/:id",
    protect,
    authorizeRoles("admin"),
    adminDownloadCertificate
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
    upload.single("certificateImage"),
    approvePayment
);

router.patch(
    "/:id/reject",
    protect,
    authorizeRoles("admin"),
    rejectPayment
);

export default router;