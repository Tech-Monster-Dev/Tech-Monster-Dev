import express from "express";

import { protect } from "../../core/security/auth.middleware.js";
import authorizeRoles from "../../core/security/role.middleware.js";

import {
    createTask,
    getMyTasks,
    updateTask,
    deleteTask,
    updateTaskStatus,
    submitTask,
    getPendingTasks,
    getTaskDetails,
    approveTask,
    rejectTask,
    getSingleTask,

} from "./task.controller.js";

const router = express.Router();

// Employer creates task
router.post(
    "/",
    protect,
    authorizeRoles("admin"),
    createTask
);

// Student gets own tasks
router.get(
    "/my-tasks",
    protect,
    authorizeRoles("student"),
    getMyTasks
);

router.get(
    "/my-tasks/:id",
    protect,
    authorizeRoles("student"),
    getSingleTask
);

// Employer updates task
router.put(
    "/:id",
    protect,
    authorizeRoles("admin"),
    updateTask
);

// Employer deletes task
router.delete(
    "/:id",
    protect,
    authorizeRoles("admin"),
    deleteTask
);

// Student updates task status
router.patch(
    "/:id/status",
    protect,
    authorizeRoles("student"),
    updateTaskStatus
);

// Student submits a coding task for approval (POST spec requirement).
router.post(
    "/submit",
    protect,
    authorizeRoles("student"),
    submitTask
);

// ======================================
// ADMIN TASK REVIEW
// ======================================
router.get(
    "/pending",
    protect,
    authorizeRoles("admin"),
    getPendingTasks
);

router.get(
    "/details/:id",
    protect,
    authorizeRoles("admin"),
    getTaskDetails
);

router.patch(
    "/approve/:id",
    protect,
    authorizeRoles("admin"),
    approveTask
);

router.patch(
    "/reject/:id",
    protect,
    authorizeRoles("admin"),
    rejectTask
);

export default router;