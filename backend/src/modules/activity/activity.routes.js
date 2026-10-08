import express from "express";

import authMiddleware from "../core/security/auth.middleware.js";

import authorizeRoles from "../core/security/role.middleware.js";

import {
    getMyActivities,
    getAllActivities
} from "./activity.controller.js";

const router = express.Router();

router.get(
    "/me",
    authMiddleware,
    getMyActivities
);

router.get(
    "/all",
    authMiddleware,
    authorizeRoles("admin"),
    getAllActivities
);

export default router;