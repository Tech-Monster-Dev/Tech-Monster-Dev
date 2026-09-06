import User from "../user/models/User.js";
import Internship from "../internships/models/Internship.js";
import ChatBlock from "../messages/models/ChatBlock.js";

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

    // Search by internship/course title OR category (case-insensitive).
    if (keyword) {
        const regex = new RegExp(keyword, "i");
        query.$or = [{ title: regex }, { category: regex }];
    }

    if (category) {
        query.category = category;
    }

    if (level) {
        query.level = level;
    }

    let sortOption = { createdAt: -1 };
    if (sort === "oldest") {
        sortOption = { createdAt: 1 };
    }

    const total = await Internship.countDocuments(query);
    const internships = await Internship.find(query)
        .sort(sortOption)
        .skip((Number(page) - 1) * Number(limit))
        .limit(Number(limit));

    return res.status(200).json({
        success: true,
        currentPage: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        total,
        internships,
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

    return res.status(200).json({
        success: true,
        users,
    });
});
