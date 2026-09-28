import ActivityLog from "../../activity/models/ActivityLog.js";

const getRecentActivities = async () => {
    const activities = await ActivityLog.find()
        .populate(
            "user",
            "firstName lastName avatar email"
        )
        .sort({
            createdAt: -1
        })
        .limit(10);

    return activities.map(activity => ({
        _id: activity._id,
        user: activity.user
            ? {
                _id: activity.user._id,
                fullName: `${activity.user.firstName} ${activity.user.lastName}`,
                email: activity.user.email,
                avatar: activity.user.avatar
            }
            : null,

        action: activity.action,
        module: activity.module,
        description: activity.description,
        ipAddress: activity.ipAddress,
        userAgent: activity.userAgent,
        createdAt: activity.createdAt
    }));
};

export default getRecentActivities;