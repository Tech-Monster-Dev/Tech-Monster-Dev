import Attendance from "./models/Attendance.js";

import AttendanceActivity from "./models/AttendanceActivity.js";
import StudentInternship from "../internships/models/StudentInternship.js";
import Course from "../courses/models/Course.js";
import Internship from "../internships/models/Internship.js";
import User from "../user/models/User.js";

import asyncHandler from "../../core/http/asyncHandler.js";
import AppError from "../../core/errors/AppError.js";
import logActivity from "../activity/logActivity.js";
import { recordActiveTime as saveActiveTime } from "./activeTime.service.js";
import { ensureDailyAttendance } from "./services/dailyAttendance.service.js";
import { emitToUser } from "../../infrastructure/socket/socket.js";

export const getMyAttendance = asyncHandler(async (req, res) => {

    const enrollments =
        await StudentInternship.find({
            student: req.user._id,
            $or: [
                {
                    course: {
                        $exists: true,
                        $ne: null
                    }
                },
                {
                    internship: {
                        $exists: true,
                        $ne: null
                    }
                }
            ]
        })
            .populate("course", "title slug")
            .populate("internship", "title slug")
            .sort({
                startedAt: 1,
                createdAt: 1
            });

    const validEnrollments =
        enrollments.filter(
            enrollment => enrollment.startedAt
        );

    const attendanceRecords =
        await Attendance.find({
            student: req.user._id,
            status: "Present"
        })
            .select(
                "student createdAt checkIn checkOut status workingHours workingMinutes"
            )
            .sort({
                createdAt: 1
            });

    const attendance =
        attendanceRecords.map(record => {

            const attendanceDate =
                new Date(record.createdAt);

            const enrollment =
                validEnrollments
                    .filter(item =>
                        new Date(item.startedAt) <=
                        attendanceDate
                    )
                    .sort((a, b) =>
                        new Date(b.startedAt) -
                        new Date(a.startedAt)
                    )[0];

            const program =
                enrollment?.course ||
                enrollment?.internship ||
                null;

            return {
                _id: record._id,
                student: record.student,
                createdAt: record.createdAt,
                checkIn: record.checkIn || record.createdAt,
                checkOut: record.checkOut || null,
                status: "Present",

                workingHours:
                    record.workingHours || 0,

                workingMinutes:
                    record.workingMinutes || 0,

                enrollmentDate:
                    enrollment?.startedAt || null,

                enrollmentType:
                    enrollment?.course
                        ? "course"
                        : enrollment?.internship
                            ? "internship"
                            : null,

                enrollmentId:
                    program?._id || null,

                enrollmentTitle:
                    program?.title || "",

                enrollmentSlug:
                    program?.slug || ""
            };
        });

    const firstAttendanceDate =
        validEnrollments.length > 0
            ? validEnrollments[0].startedAt
            : null;

    const student = await User.findById(
        req.user._id
    ).select("createdAt");

    return res.status(200).json({
        success: true,

        attendance,

        firstAttendanceDate,

        accountCreatedAt:
            student?.createdAt || null,

        enrollments:
            validEnrollments.map(enrollment => ({
                _id: enrollment._id,

                type:
                    enrollment.course
                        ? "course"
                        : "internship",

                programId:
                    enrollment.course?._id ||
                    enrollment.internship?._id ||
                    null,

                title:
                    enrollment.course?.title ||
                    enrollment.internship?.title ||
                    "",

                slug:
                    enrollment.course?.slug ||
                    enrollment.internship?.slug ||
                    "",

                startedAt:
                    enrollment.startedAt
            }))
    });

});


export const getInternAttendance = asyncHandler(async (req, res) => {

    const attendance = await Attendance.find({

        internship: req.params.id

    })

        .populate(

            "student",

            "firstName lastName email profileImage"

        )

        .sort({

            createdAt: -1

        });

    return res.status(200).json({

        success: true,

        attendance

    });

});
export const getTodayActiveTime = asyncHandler(async (req, res) => {

    const { getTodayActiveTime: getActiveTime } = await import("./activeTime.service.js");

    const activeSeconds = await getActiveTime(req.user._id);

    return res.status(200).json({
        success: true,
        activeSeconds
    });

});

export const recordActiveTime = asyncHandler(async (req, res) => {

    const { activeSeconds } = req.body;

    if (
        typeof activeSeconds !== "number" ||
        !Number.isFinite(activeSeconds) ||
        activeSeconds <= 0
    ) {

        throw new AppError(
            "Valid active time is required",
            400
        );

    }

    const activity = await saveActiveTime(
        req.user._id,
        activeSeconds
    );

    await ensureDailyAttendance(
        req.user._id
    );


    const UserBadge = (await import(
        '../profile/models/UserBadge.js'
    )).default;

    const badges = await UserBadge.find({
        user: req.user._id
    })
        .populate(
            'badge',
            'title icon description color requirement category'
        )
        .sort({
            earnedAt: -1
        });

    emitToUser(
        req.user._id,
        "studentDashboardSync",
        {
            reason: "activeTimeUpdated",
            activeSeconds:
                activity?.activeSeconds || 0,
            badges: badges.map(item => ({
                _id: item.badge?._id,
                title: item.badge?.title,
                icon: item.badge?.icon,
                description: item.badge?.description,
                color: item.badge?.color,
                requirement: item.badge?.requirement,
                category: item.badge?.category,
                earnedAt: item.earnedAt
            }))
        }
    );

    return res.status(200).json({

        success: true,

        activeSeconds:
            activity?.activeSeconds || 0,

        badges: badges.map(item => ({
            _id: item.badge?._id,
            title: item.badge?.title,
            icon: item.badge?.icon,
            description: item.badge?.description,
            color: item.badge?.color,
            requirement: item.badge?.requirement,
            category: item.badge?.category,
            earnedAt: item.earnedAt
        }))

    });

});
