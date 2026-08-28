import express from "express";

import { protect } from "../../core/security/auth.middleware.js";

import authorizeRoles from "../../core/security/role.middleware.js";

import {

    getMyAttendance,

    getInternAttendance,

    recordActiveTime,

    getTodayActiveTime

} from "./attendance.controller.js";

const router = express.Router();

router.get(
    "/active-time",
    protect,
    authorizeRoles("student"),
    getTodayActiveTime
);

router.post(
    "/active-time",
    protect,
    authorizeRoles("student"),
    recordActiveTime
);

router.get(
    "/my-attendance",
    protect,
    authorizeRoles("student"),
    getMyAttendance
);

router.get(
    "/internship/:id",

    protect,
    authorizeRoles("employer"),
    getInternAttendance
);

export default router;