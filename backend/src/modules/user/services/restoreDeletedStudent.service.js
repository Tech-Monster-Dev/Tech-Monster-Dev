import fs from "fs";

import Attendance from "../../attendance/models/Attendance.js";
import AttendanceActivity from "../../attendance/models/AttendanceActivity.js";
import CertificatePayment from "../../certificatePayments/models/CertificatePayment.js";
import Certificate from "../../certificates/models/Certificate.js";
import Feedback from "../../feedback/models/Feedback.js";
import Follow from "../../follow/models/Follow.js";
import StudentInternship from "../../internships/models/StudentInternship.js";
import LearningDay from "../../learning/models/LearningDay.js";
import ChatBlock from "../../messages/models/ChatBlock.js";
import ChatMute from "../../messages/models/ChatMute.js";
import Message from "../../messages/models/Message.js";
import Notification from "../../notifications/models/Notification.js";
import UserBadge from "../../profile/models/UserBadge.js";
import Submission from "../../submissions/models/Submission.js";
import SupportConversation from "../../support/models/SupportConversation.js";
import Task from "../../tasks/models/Task.js";
import ActivityLog from "../../activity/models/ActivityLog.js";
import User from "../models/User.js";
import DeletedStudentBackup from "../models/DeletedStudentBackup.js";
import {
    sendRestoreAccountEmail,
    safeSendActivityEmail,
} from "../../../infrastructure/email/index.js";

const restoreDeletedStudent = async (originalUserId) => {
    const backup = await DeletedStudentBackup.findOne({
        originalUserId,
    });

    if (!backup) {
        const error = new Error("Deleted student backup not found");
        error.statusCode = 404;
        throw error;
    }

    const snapshot = backup.snapshot || {};
    const userSnapshot = snapshot.user;

    if (!userSnapshot) {
        const error = new Error("Student user backup data is missing");
        error.statusCode = 500;
        throw error;
    }

    const existingUser = await User.findOne({
        $or: [
            { _id: originalUserId },
            { email: userSnapshot.email },
            { username: userSnapshot.username },
        ],
    });

    if (existingUser) {
        const error = new Error(
            "A user with the backed-up ID, email, or username already exists"
        );
        error.statusCode = 409;
        throw error;
    }

    const collections = [
        ["attendance", Attendance],
        ["attendanceActivity", AttendanceActivity],
        ["certificatePayments", CertificatePayment],
        ["certificates", Certificate],
        ["feedback", Feedback],
        ["follows", Follow],
        ["studentInternships", StudentInternship],
        ["learningDays", LearningDay],
        ["chatBlocks", ChatBlock],
        ["chatMutes", ChatMute],
        ["messages", Message],
        ["notifications", Notification],
        ["userBadges", UserBadge],
        ["submissions", Submission],
        ["supportConversations", SupportConversation],
        ["tasks", Task],
        ["activityLogs", ActivityLog],
    ];

    const restoredIds = [];

    try {
        const restoredUser = await User.create({
            ...userSnapshot,
            _id: originalUserId,
            refreshToken: undefined,
        });

        restoredIds.push({ model: User, id: restoredUser._id });

        for (const [snapshotKey, Model] of collections) {
            const documents = snapshot[snapshotKey];

            if (!Array.isArray(documents) || !documents.length) {
                continue;
            }

            for (const document of documents) {
                restoredIds.push({
                    model: Model,
                    id: document._id,
                });
            }

            await Model.insertMany(documents, {
                ordered: true,
            });
        }

        await DeletedStudentBackup.deleteOne({
            _id: backup._id,
        });

        await fs.promises.rm(backup.backupFolder, {
            recursive: true,
            force: true,
        });

        safeSendActivityEmail(
            "Restore account email",
            () => sendRestoreAccountEmail(restoredUser)
        );

        return restoredUser;
    } catch (error) {
        await Promise.all(
            restoredIds.map(({ model: Model, id }) =>
                Model.deleteOne({ _id: id })
            )
        );

        throw error;
    }
};

export default restoreDeletedStudent;