import express from "express";

import {
    createNotice,
    getAllNotices,
    updateNotice,
    deleteNotice
} from "./notice.controller.js";

import { protect } from "../../core/security/auth.middleware.js";
import upload from "../../infrastructure/storage/upload.middleware.js";
import authorizeRoles from "../../core/security/role.middleware.js";

const router = express.Router();

router.post(
    "/",
    protect,
    authorizeRoles("admin"),
    upload.single("img"),
    createNotice
);

router.put(
    "/:id",
    protect,
    authorizeRoles("admin"),
    upload.single("img"),
    updateNotice
);

router.delete(
    "/:id",
    protect,
    authorizeRoles("admin"),
    deleteNotice
);

router.get("/", getAllNotices);

export default router;
