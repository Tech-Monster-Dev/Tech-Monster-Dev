import OTP from "../../auth/models/OTP.js";
import RefreshToken from "../../auth/models/RefreshToken.js";
import Attendance from "../../attendance/models/Attendance.js";
import StudentInternship from "../../internships/models/StudentInternship.js";
import Submission from "../../submissions/models/Submission.js";
import Task from "../../tasks/models/Task.js";
import Message from "../../messages/models/Message.js";
import Notification from "../../notifications/models/Notification.js";
import Certificate from "../../certificates/models/Certificate.js";
import UserBadge from "../../profile/models/UserBadge.js";
import Follow from "../../follow/models/Follow.js";
import ActivityLog from "../../activity/models/ActivityLog.js";
import User from "../models/User.js";

const deleteAccountData = async (user) => {

    const userId = user._id;

    await Promise.all([
        OTP.deleteMany({
            email: user.email
        }),

        RefreshToken.deleteMany({
            user: userId
        }),

        Attendance.deleteMany({
            student: userId
        }),

        StudentInternship.deleteMany({
            student: userId
        }),

        Submission.deleteMany({
            student: userId
        }),

        Task.deleteMany({
            assignedTo: userId
        }),

        Notification.deleteMany({
            user: userId
        }),

        Certificate.deleteMany({
            student: userId
        }),

        UserBadge.deleteMany({
            user: userId
        }),

        Follow.deleteMany({
            $or: [
                {
                    follower: userId
                },
                {
                    following: userId
                }
            ]
        }),

        Message.deleteMany({
            $or: [
                {
                    sender: userId
                },
                {
                    receiver: userId
                },
                {
                    deletedFor: userId
                }
            ]
        }),

        ActivityLog.deleteMany({
            user: userId
        })
    ]);

    await User.findByIdAndDelete(userId);
};

export default deleteAccountData;
