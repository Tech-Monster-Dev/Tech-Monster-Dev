import UserBadge from "../../profile/models/UserBadge.js";

const getBadges = async (userId) => {

    const badges = await UserBadge.find({

        user: userId

    })

        .populate(

            "badge"

        )

        .sort({

            createdAt: -1

        });

    return badges.map(item => ({

        _id: item.badge._id,

        title: item.badge.title,

        description: item.badge.description,

        icon: item.badge.icon,

        color: item.badge.color,

        category: item.badge.category,

        earnedAt: item.createdAt

    }));

};

export default getBadges;