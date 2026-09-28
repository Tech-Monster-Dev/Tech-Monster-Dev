import User from "../../user/models/User.js";
import { getLatestStudentBadge } from "../../profile/services/studentBadge.service.js";

const getSuggestedUsers = async (userId) => {
    const users = await User.find({
        role: "student",
        profileCompleted: true,
        _id: { $ne: userId }
    })
        .select(
            "firstName lastName avatar bio skills"
        )
        .sort({
            createdAt: -1
        })
        .limit(4);

    return Promise.all(
        users.map(async user => ({
            _id: user._id,
            fullName: `${user.firstName} ${user.lastName}`,
            avatar: user.avatar,
            bio: user.bio,
            skills: user.skills,
            latestBadge: await getLatestStudentBadge(user._id)
        }))
    );
};

export default getSuggestedUsers;