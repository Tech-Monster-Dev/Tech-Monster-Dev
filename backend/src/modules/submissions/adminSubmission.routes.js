import express from "express";

import {
    protect,
} from "../../core/security/auth.middleware.js";

import authorizeRoles from "../../core/security/role.middleware.js";

import {
    getAllSubmissions,
    getSubmissionDetails,
    approveSubmission,
    rejectSubmission,
    extendSubmissionDeadline,
} from "./controllers/adminSubmission.controller.js";

const router =
    express.Router();

router.get(
    "/",
    protect,
    authorizeRoles("admin"),
    getAllSubmissions
);

router.get(
    "/:id",
    protect,
    authorizeRoles("admin"),
    getSubmissionDetails
);

router.put(
    "/:id/approve",
    protect,
    authorizeRoles("admin"),
    approveSubmission
);

router.put(
    "/:id/reject",
    protect,
    authorizeRoles("admin"),
    rejectSubmission
);

router.put(
    "/:id/extend",
    protect,
    authorizeRoles("admin"),
    extendSubmissionDeadline
);

export default router;