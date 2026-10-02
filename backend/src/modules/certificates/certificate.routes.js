import express from "express";

import {
    getMyCertificates,
    downloadCertificate,
    verifyCertificate
} from "./certificate.controller.js";

import { protect } from "../../core/security/auth.middleware.js";

const router = express.Router();

router.get(
    "/verify/:token",
    verifyCertificate
);

router.get(
    "/my",
    protect,
    getMyCertificates
);

router.get(
    "/download/:id",
    protect,
    downloadCertificate
);

export default router;