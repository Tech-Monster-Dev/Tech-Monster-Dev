import User from "../user/models/User.js";
import Internship from "../internships/models/Internship.js";
import Course from "../courses/models/Course.js";
import ChatBlock from "../messages/models/ChatBlock.js";
import { getLatestStudentBadge } from "../profile/services/studentBadge.service.js";

import asyncHandler from "../../core/http/asyncHandler.js";

// =====================================
// SEARCH INTERNSHIPS / COURSES
// =====================================
export const searchInternships = asyncHandler(async (req, res) => {
    const {
        keyword = "",
        category = "",
        level = "",
        sort = "newest",
        page = 1,
        limit = 10,
    } = req.query;

    const query = { isPublished: true };

    if (keyword) {
        const regex = new RegExp(keyword.trim(), "i");
        query.$or = [
            { title: regex },
            { category: regex },
            { description: regex },
        ];
    }

    if (category) {
        query.category = category;
    }

    if (level) {
        query.level = level;
    }

    const sortOption = sort === "oldest"
        ? { createdAt: 1 }
        : { createdAt: -1 };

    const [courses, internships] = await Promise.all([
        Course.find(query)
            .sort(sortOption)
            .limit(Number(limit)),
        Internship.find(query)
            .sort(sortOption)
            .limit(Number(limit)),
    ]);

    const results = [
        ...courses.map(item => ({
            ...item.toObject(),
            type: "course",
        })),
        ...internships.map(item => ({
            ...item.toObject(),
            type: "internship",
        })),
    ].sort((a, b) => (
        sort === "oldest"
            ? new Date(a.createdAt) - new Date(b.createdAt)
            : new Date(b.createdAt) - new Date(a.createdAt)
    )).slice(0, Number(limit));

    return res.status(200).json({
        success: true,
        total: results.length,
        courses: results.filter(item => item.type === "course"),
        internships: results.filter(item => item.type === "internship"),
        results,
    });
});

// =====================================
// SEARCH USERS
// =====================================
export const searchUsers = asyncHandler(async (req, res) => {
    const { keyword = "", limit = 8 } = req.query;

    if (!keyword.trim()) {
        return res.status(200).json({
            success: true,
            users: [],
        });
    }

    const regex = new RegExp(keyword.trim(), "i");

    const blockedUsers = await ChatBlock.find({ blocker: req.user._id }).select("blockedUser");
    const blockedUserIds = blockedUsers.map((block) => block.blockedUser);

    const users = await User.find({
        $or: [
            { username: regex },
            { firstName: regex },
            { lastName: regex },
        ],
        isBlocked: { $ne: true },
    })
        .select("-password -refreshToken")
        .limit(Number(limit));

    const usersWithBadges = await Promise.all(
        users.map(async user => ({
            ...user.toObject(),
            latestBadge: user.role === "student"
                ? await getLatestStudentBadge(user._id)
                : null
        }))
    );

    return res.status(200).json({
        success: true,
        users: usersWithBadges,
    });
});
