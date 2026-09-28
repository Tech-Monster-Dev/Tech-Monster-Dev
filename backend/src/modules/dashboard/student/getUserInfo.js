import User from "../../user/models/User.js";

const getUserInfo = async (userId) => {
    const user = await User.findById(userId).select("-password");

    if (!user) {
        throw new Error("User not found");
    }

    return {
        _id: user._id,
        fullName: `${user.firstName} ${user.lastName}`,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        username: user.username,
        avatar: user.avatar,
        phone: user.phone,
        bio: user.bio,
        gender: user.gender,
        education: user.education,
        college: user.college,
        branch: user.branch,
        year: user.year,
        semester: user.semester,
        github: user.github,
        linkedin: user.linkedin,
        skills: user.skills,
        district: user.district,
        state: user.state,
        currentAddress: user.currentAddress,
        localAddress: user.localAddress,
        profileCompleted: user.profileCompleted,
        profileCompletion: user.profileCompleted ? 100 : 70,
        joinedAt: user.createdAt,
        lastLogin: user.lastLogin
    };
};

export default getUserInfo;