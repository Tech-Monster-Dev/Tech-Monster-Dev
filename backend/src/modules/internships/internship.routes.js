import express from "express";

import {
    createInternship,
    getAllInternships,
    getSingleInternship,
    joinInternship,
    getMyInternships,
    updateInternshipProgress,
    completeInternship,
    completeLesson,
    getCompletedLessons,
    updateInternship,
    deleteInternship,
} from "./internship.controller.js";

import { protect } from "../../core/security/auth.middleware.js";
import upload from "../../infrastructure/storage/upload.middleware.js";

import authorizeRoles from "../../core/security/role.middleware.js";
const router = express.Router();

// ADMIN
router.post(
    "/",
    protect,
    authorizeRoles("admin"),
    upload.single("img"),
    createInternship
);

router.put(
    "/:id",
    protect,
    authorizeRoles("admin"),
    upload.single("img"),
    updateInternship
);

router.delete(
    "/:id",
    protect,
    authorizeRoles("admin"),
    deleteInternship
);

// PUBLIC
router.get(
    "/",
    getAllInternships
);

router.get(
    "/slug/:slug",
    getSingleInternship
);

router.get(
    "/:id",
    getSingleInternship
);

// STUDENT
router.post(
    "/slug/:slug/complete-lesson",
    protect,
    authorizeRoles("student"),
    completeLesson
);

router.get(
    "/slug/:slug/completed-lessons",
    protect,
    authorizeRoles("student"),
    getCompletedLessons
);

router.post(
    "/:id/join",
    protect,
    authorizeRoles("student"),
    joinInternship
);

router.get(
    "/student/my",
    protect,
    authorizeRoles("student"),
    getMyInternships
);

router.put(
    "/:id/progress",
    protect,
    authorizeRoles("student"),
    updateInternshipProgress
);

router.put(
    "/:id/complete",
    protect,
    authorizeRoles("student"),
    completeInternship
);

export default router;