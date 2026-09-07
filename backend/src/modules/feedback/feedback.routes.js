import express from "express";

import {
    submitFeedback,
    getWebsiteFeedback,
    getMyResourceFeedback
} from "./feedback.controller.js";

import { protect } from "../../core/security/auth.middleware.js";
import authorizeRoles from "../../core/security/role.middleware.js";
import validate from "../../core/validation/validate.middleware.js";

import { baseFeedbackSchema } from "./feedback.validation.js";

const router = express.Router();

router.get(
    "/website",
    getWebsiteFeedback
);

router.get(
    "/my/:type",
    protect,
    authorizeRoles("student"),
    getMyResourceFeedback
);

router.post(
    "/",
    protect,
    authorizeRoles("student"),
    validate(baseFeedbackSchema),
    submitFeedback
);

export default router;
