import ActivityLog from "./models/ActivityLog.js";
import asyncHandler from "../core/http/asyncHandler.js";

export const getMyActivities = asyncHandler(async (req, res) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const totalActivities = await ActivityLog.countDocuments({
        user: req.user._id
    });

    const activities = await ActivityLog.find({
        user: req.user._id
    })
        .sort({
            createdAt: -1
        })
        .skip((page - 1) * limit)
        .limit(limit);

    return res.status(200).json({
        success: true,
        currentPage: page,
        totalPages: Math.ceil(totalActivities / limit),
        totalActivities,
        activities
    });
});

export const getAllActivities = asyncHandler(async (req, res) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const totalActivities = await ActivityLog.countDocuments();

    const activities = await ActivityLog.find()
        .populate(
            "user",
            "firstName lastName email role"
        )

        .sort({
            createdAt: -1
        })
        .skip((page - 1) * limit)
        .limit(limit);

    return res.status(200).json({
        success: true,
        currentPage: page,
        totalPages: Math.ceil(totalActivities / limit),
        totalActivities,
        activities
    });
});