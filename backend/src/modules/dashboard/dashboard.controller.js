import asyncHandler from "../../core/http/asyncHandler.js";

import {
    getUserInfo,
    getStats as getStudentStats,
    getAttendance as getStudentAttendance,
    getWeeklyAnalytics,
    getMyInternships,
    getMyCourses,
    getAllInternships,
    getAllCourses,
    getRecommendedInternships,
    getSuggestedUsers,
    getBadges,
    getActiveTime
} from "./student/index.js";

import {
    getStats as getAdminStats,
    getAttendance as getAdminAttendance,
    getWeeklyAttendance,
    getRecentActivities,
    getActiveStudents,
    getTopInternships,
    getRecentTasks,
    getCertificates
} from "./admin/index.js";

export const studentDashboard = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    console.log("userId", userId);
    const [
        user,
        stats,
        attendance,
        analytics,
        internships,
        courses,
        allInternships,
        allCourses,
        recommendedInternships,
        suggestedUsers,
        badges,
        activeTime
    ] = await Promise.all([
        getUserInfo(userId),
        getStudentStats(userId),
        getStudentAttendance(userId),
        getWeeklyAnalytics(userId),
        getMyInternships(userId),
        getMyCourses(userId),
        getAllInternships(userId),
        getAllCourses(userId),
        getRecommendedInternships(userId),
        getSuggestedUsers(userId),
        getBadges(userId),
        getActiveTime(userId)
    ]);

    return res.status(200).json({
        success: true,
        dashboard: {
            user,
            stats,
            dayStreak: attendance?.dayStreak || 0,

            streak: {
                days: stats?.streak || 0,
                progress: Math.min(
                    Math.round(
                        ((stats?.streak || 0) / 7) * 100
                    ),
                    100
                )
            },

            attendance,
            analytics,
            internships,
            courses,
            allInternships,
            allCourses,
            recommendedInternships,
            suggestedUsers,
            badges,
            activeTime
        }
    });

});


export const adminDashboard = asyncHandler(async (req, res) => {

    const [
        stats,
        attendanceSummary,
        weeklyAttendance,
        recentActivities,
        activeStudents,
        topInternships,
        recentTasks,
        certificateAnalytics

    ] = await Promise.all([
        getAdminStats(),
        getAdminAttendance(),
        getWeeklyAttendance(),
        getRecentActivities(),
        getActiveStudents(),
        getTopInternships(),
        getRecentTasks(),
        getCertificates()
    ]);

    return res.status(200).json({

        success: true,

        dashboard: {
            stats,
            streak: stats?.streak || 0,
            attendanceSummary,
            weeklyAttendance,
            recentActivities,
            activeStudents,
            topInternships,
            recentTasks,
            certificateAnalytics
        }

    });

});
