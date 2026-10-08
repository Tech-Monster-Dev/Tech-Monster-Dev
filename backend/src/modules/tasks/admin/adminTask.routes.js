import express from "express";

import { protect } from "../../../core/security/auth.middleware.js";
import authorizeRoles from "../../../core/security/role.middleware.js";

import {
    getPendingTasks,
    getApprovedTasks,
    getTaskDetails,
    approveTask,
    rejectTask
} from "./adminTask.controller.js";

const router = express.Router();

router.get(
    "/pending",
    protect,
    authorizeRoles("admin"),
    getPendingTasks
);

router.get(
    "/approved",
    protect,
    authorizeRoles("admin"),
    getApprovedTasks
);

router.get(
    "/:id",
    protect,
    authorizeRoles("admin"),
    getTaskDetails
);

router.patch(
    "/:id/approve",
    protect,
    authorizeRoles("admin"),
    approveTask
);

router.patch(
    "/:id/reject",
    protect,
    authorizeRoles("admin"),
    rejectTask
);

export default router;