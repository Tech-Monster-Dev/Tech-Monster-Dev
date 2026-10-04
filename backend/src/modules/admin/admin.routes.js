import express from "express";

import { protect } from "../../core/security/auth.middleware.js";
import authorizeRoles from "../../core/security/role.middleware.js";

import {
    getDashboardStats,
    getSingleUser,
    getAllUsers,
    blockUser,
    unblockUser,
    deleteUser,
    updateUser,
    restoreUser,
} from "./admin.controller.js";

const router = express.Router();

router.get(
    "/dashboard",
    protect,
    authorizeRoles("admin"),
    getDashboardStats
);

router.get(
    "/users/:id",
    protect,
    authorizeRoles("admin"),
    getSingleUser
);

router.get(
    "/users",
    protect,
    authorizeRoles("admin"),
    getAllUsers
);

router.put(
    "/users/:id",
    protect,
    authorizeRoles("admin"),
    updateUser
);

router.patch(
    "/users/:id/block",
    protect,
    authorizeRoles("admin"),
    blockUser
);

router.patch(
    "/users/:id/unblock",
    protect,
    authorizeRoles("admin"),
    unblockUser
);

router.delete(
    "/users/:id",
    protect,
    authorizeRoles("admin"),
    deleteUser
);

router.patch(
    "/users/:id/restore",
    protect,
    authorizeRoles("admin"),
    restoreUser
);

export default router;