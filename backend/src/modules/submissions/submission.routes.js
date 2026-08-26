import express from "express";

import {
    protect,
} from "../../core/security/auth.middleware.js";

import authorizeRoles from "../../core/security/role.middleware.js";

import {
    submitCode,
    getMySubmissions,
    getMyCourseSubmissions,
} from "./controllers/submission.controller.js";

const router =
    express.Router();

router.post(
    "/",
    protect,
    authorizeRoles("student"),
    submitCode
);

router.get(
    "/my",
    protect,
    authorizeRoles("student"),
    getMySubmissions
);

router.get(
    "/course/:courseSlug",
    protect,
    authorizeRoles("student"),
    getMyCourseSubmissions
);

export default router;