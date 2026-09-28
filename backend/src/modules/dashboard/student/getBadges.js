import UserBadge from "../../profile/models/UserBadge.js";
import { syncCompletionBadges } from "../../profile/services/badgeAward.service.js";

const getBadges = async (userId) => {
    await syncCompletionBadges(userId);
    const badges = await UserBadge.find({
        user: userId
    })
        .populate(
            "badge"
        )
        .sort({
            earnedAt: -1
        });

    return badges.map(item => ({
        _id: item.badge._id,
        title: item.badge.title,
        description: item.badge.description,
        icon: item.badge.icon,
        color: item.badge.color,
        category: item.badge.category,
        earnedAt: item.earnedAt
    }));
};

export default getBadges;