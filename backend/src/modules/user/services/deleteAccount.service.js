import OTP from "../../auth/models/OTP.js";
import RefreshToken from "../../auth/models/RefreshToken.js";
import Attendance from "../../attendance/models/Attendance.js";
import AttendanceActivity from "../../attendance/models/AttendanceActivity.js";
import CertificatePayment from "../../certificatePayments/models/CertificatePayment.js";
import StudentInternship from "../../internships/models/StudentInternship.js";
import LearningDay from "../../learning/models/LearningDay.js";
import Submission from "../../submissions/models/Submission.js";
import Task from "../../tasks/models/Task.js";
import ChatBlock from "../../messages/models/ChatBlock.js";
import ChatMute from "../../messages/models/ChatMute.js";
import Message from "../../messages/models/Message.js";
import Notification from "../../notifications/models/Notification.js";
import Certificate from "../../certificates/models/Certificate.js";
import UserBadge from "../../profile/models/UserBadge.js";
import Feedback from "../../feedback/models/Feedback.js";
import Follow from "../../follow/models/Follow.js";
import SupportConversation from "../../support/models/SupportConversation.js";
import ActivityLog from "../../activity/models/ActivityLog.js";
import User from "../models/User.js";
import DeletedStudentBackup from "../models/DeletedStudentBackup.js";
import { createStudentBackup } from "./studentBackup.service.js";
import {
    sendAccountDeletedEmail,
    safeSendActivityEmail,
} from "../../../infrastructure/email/index.js";

const deleteAccountData = async (user, deletedBy = null) => {
    const userId = user._id;

    const backup = await createStudentBackup(user);

    await DeletedStudentBackup.findOneAndDelete({
        originalUserId: userId,
    });

    try {
        await DeletedStudentBackup.create({
            originalUserId: backup.originalUserId,
            studentName: backup.studentName,
            studentEmail: backup.studentEmail,
            backupFolder: backup.backupFolder,
            pdfPath: backup.pdfPath,
            snapshot: backup.snapshot,
            deletedBy,
        });

        await Promise.all([
            OTP.deleteMany({
                email: backup.studentEmail,
            }),
            RefreshToken.deleteMany({
                user: userId,
            }),
            Attendance.deleteMany({
                student: userId,
            }),
            AttendanceActivity.deleteMany({
                student: userId,
            }),
            CertificatePayment.deleteMany({
                student: userId,
            }),
            StudentInternship.deleteMany({
                student: userId,
            }),
            LearningDay.deleteMany({
                student: userId,
            }),
            Submission.deleteMany({
                student: userId,
            }),
            Task.deleteMany({
                assignedTo: userId,
            }),
            ChatBlock.deleteMany({
                $or: [
                    { blocker: userId },
                    { blockedUser: userId },
                ],
            }),
            ChatMute.deleteMany({
                $or: [
                    { user: userId },
                    { mutedUser: userId },
                ],
            }),
            Message.deleteMany({
                $or: [
                    { sender: userId },
                    { receiver: userId },
                    { deletedFor: userId },
                    { starredBy: userId },
                ],
            }),
            Notification.deleteMany({
                user: userId,
            }),
            Certificate.deleteMany({
                student: userId,
            }),
            UserBadge.deleteMany({
                user: userId,
            }),
            Feedback.deleteMany({
                student: userId,
            }),
            Follow.deleteMany({
                $or: [
                    { follower: userId },
                    { following: userId },
                ],
            }),
            SupportConversation.deleteMany({
                student: userId,
            }),
            ActivityLog.deleteMany({
                user: userId,
            }),
        ]);

        await User.findByIdAndDelete(userId);

        safeSendActivityEmail(
            "Account deleted email",
            () => sendAccountDeletedEmail(user)
        );
    } catch (error) {
        await DeletedStudentBackup.deleteOne({
            originalUserId: userId,
        });
        throw error;
    }
};

export default deleteAccountData;