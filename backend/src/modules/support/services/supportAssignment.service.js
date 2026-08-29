import SupportConversation from "../models/SupportConversation.js";
import User from "../../user/models/User.js";
import AppError from "../../../core/errors/AppError.js";

export const assignSupportAdmin = async (conversationId) => {

    const conversation =
        await SupportConversation.findById(
            conversationId
        );

    if (!conversation) {
        throw new AppError(
            "Support conversation not found.",
            404
        );
    }

    if (conversation.assignedAdmin) {
        return conversation.populate(
            "assignedAdmin",
            "firstName lastName email avatar"
        );
    }

    const admins = await User.find({
        role: "admin",
        isBlocked: false
    })
        .select("_id firstName lastName email avatar")
        .sort({
            lastLogin: -1,
            createdAt: 1
        });

    if (!admins.length) {
        throw new AppError(
            "No support admin is available.",
            503
        );
    }

    const adminIds = admins.map(
        admin => admin._id
    );

    const workload = await SupportConversation.aggregate([
        {
            $match: {
                assignedAdmin: {
                    $in: adminIds
                },
                status: {
                    $in: ["open", "pending"]
                }
            }
        },
        {
            $group: {
                _id: "$assignedAdmin",
                count: {
                    $sum: 1
                }
            }
        }
    ]);

    const workloadMap = new Map(
        workload.map(item => [
            item._id.toString(),
            item.count
        ])
    );

    const selectedAdmin =
        admins.reduce(
            (best, admin) => {

                const currentCount =
                    workloadMap.get(
                        admin._id.toString()
                    ) || 0;

                const bestCount =
                    workloadMap.get(
                        best._id.toString()
                    ) || 0;

                if (currentCount < bestCount) {
                    return admin;
                }

                return best;
            },
            admins[0]
        );

    conversation.assignedAdmin =
        selectedAdmin._id;

    await conversation.save();

    return conversation.populate(
        "assignedAdmin",
        "firstName lastName email avatar"
    );
};
