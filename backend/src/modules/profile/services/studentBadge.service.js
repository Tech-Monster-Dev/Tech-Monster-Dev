import UserBadge from "../models/UserBadge.js";

export const getLatestStudentBadge = async (userId) => {
    const userBadge = await UserBadge.findOne({
        user: userId
    })
        .populate(
            "badge",
            "title icon description color requirement category"
        )
        .sort({
            earnedAt: -1
        })
        .lean();

    if (!userBadge?.badge) {
        return null;
    }

    return {
        _id: userBadge.badge._id,
        title: userBadge.badge.title,
        icon: userBadge.badge.icon,
        description: userBadge.badge.description,
        color: userBadge.badge.color,
        requirement: userBadge.badge.requirement,
        category: userBadge.badge.category,
        earnedAt: userBadge.earnedAt
    };
};
