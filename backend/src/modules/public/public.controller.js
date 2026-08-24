import User from "../user/models/User.js";
import Internship from "../internships/models/Internship.js";
import Course from "../courses/models/Course.js";

import asyncHandler from "../../core/http/asyncHandler.js";

export const getHeroStats = asyncHandler(async (req, res) => {

    const [
        totalStudents,
        totalAdmins,
        totalInternships,
        totalCourses
    ] = await Promise.all([

        User.countDocuments({
            role: "student",
            isBlocked: false
        }),

        User.countDocuments({
            role: "admin",
            isBlocked: false
        }),

        Internship.countDocuments({
            isPublished: true
        }),

        Course.countDocuments({
            isPublished: true
        })

    ]);

    return res.status(200).json({

        success: true,

        stats: {
            students: totalStudents,
            internships: totalInternships,
            courses: totalCourses,
            admins: totalAdmins,
        }

    });

});