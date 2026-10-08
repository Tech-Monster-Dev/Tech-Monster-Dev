import express from "express";

import {
    getDailyReport,
    getWeeklyReport,
    getMonthlyReport,
    getYearlyReport,
    getAvailableYears,
    getActivityUsers,
    getUserActivity,
} from "./reports.controller.js";

import { protect } from "../../core/security/auth.middleware.js";
import authorizeRoles from "../../core/security/role.middleware.js";

const router = express.Router();

router.use(protect);
router.use(authorizeRoles("admin"));

router.get("/daily", getDailyReport);
router.get("/weekly", getWeeklyReport);
router.get("/monthly", getMonthlyReport);
router.get("/years", getAvailableYears);
router.get("/yearly", getYearlyReport);

router.get("/activity/users", getActivityUsers);
router.get("/activity/users/:userId", getUserActivity);

export default router;