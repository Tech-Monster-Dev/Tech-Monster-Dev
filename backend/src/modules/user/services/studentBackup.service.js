import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";

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

const toPlain = (documents = []) =>
    documents.map((document) =>
        typeof document?.toObject === "function"
            ? document.toObject()
            : document
    );

const getStudentName = (user) =>
    [
        user.firstName,
        user.middleName,
        user.lastName,
    ]
        .filter(Boolean)
        .join(" ")
        .trim() ||
    user.username ||
    "Student";

const getSafeFolderName = (value) =>
    String(value || "student")
        .trim()
        .replace(/[<>:"/\\|?*\x00-\x1F]/g, "-")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 100) ||
    "student";

const createSnapshot = async (user) => {
    const userId = user._id;
    const userSnapshot = await User.findById(userId).select("+password").lean();

    const [
        attendance,
        attendanceActivity,
        certificatePayments,
        certificates,
        feedback,
        follows,
        studentInternships,
        learningDays,
        chatBlocks,
        chatMutes,
        messages,
        notifications,
        userBadges,
        submissions,
        supportConversations,
        tasks,
        activityLogs,
    ] = await Promise.all([
        Attendance.find({ student: userId }).lean(),
        AttendanceActivity.find({ student: userId }).lean(),
        CertificatePayment.find({ student: userId }).lean(),
        Certificate.find({ student: userId }).lean(),
        Feedback.find({ student: userId }).lean(),
        Follow.find({
            $or: [
                { follower: userId },
                { following: userId },
            ],
        }).lean(),
        StudentInternship.find({ student: userId }).lean(),
        LearningDay.find({ student: userId }).lean(),
        ChatBlock.find({
            $or: [
                { blocker: userId },
                { blockedUser: userId },
            ],
        }).lean(),
        ChatMute.find({
            $or: [
                { user: userId },
                { mutedUser: userId },
            ],
        }).lean(),
        Message.find({
            $or: [
                { sender: userId },
                { receiver: userId },
                { deletedFor: userId },
                { starredBy: userId },
            ],
        }).lean(),
        Notification.find({ user: userId }).lean(),
        UserBadge.find({ user: userId }).lean(),
        Submission.find({ student: userId }).lean(),
        SupportConversation.find({ student: userId }).lean(),
        Task.find({ assignedTo: userId }).lean(),
        ActivityLog.find({ user: userId }).lean(),
    ]);

    return {
        user: userSnapshot,

        attendance,
        attendanceActivity,
        certificatePayments,
        certificates,
        feedback,
        follows,
        studentInternships,
        learningDays,
        chatBlocks,
        chatMutes,
        messages,
        notifications,
        userBadges,
        submissions,
        supportConversations,
        tasks,
        activityLogs,
    };
};

const writeBackupPdf = ({
    filePath,
    snapshot,
    studentName,
}) =>
    new Promise((resolve, reject) => {
        const doc = new PDFDocument({
            size: "A4",
            margin: 45,
        });

        const stream = fs.createWriteStream(filePath);

        doc.pipe(stream);

        const writeSection = (
            title,
            value
        ) => {
            doc
                .fontSize(16)
                .font("Helvetica-Bold")
                .text(title);

            doc
                .moveDown(0.4)
                .fontSize(10)
                .font("Helvetica")
                .text(
                    JSON.stringify(
                        value,
                        null,
                        2
                    ),
                    {
                        width: 500,
                        lineGap: 2,
                    }
                );

            doc.moveDown();
        };

        doc
            .fontSize(22)
            .font("Helvetica-Bold")
            .text(
                "TECH MONSTER - STUDENT BACKUP",
                {
                    align: "center",
                }
            );

        doc.moveDown();

        doc
            .fontSize(14)
            .font("Helvetica")
            .text(
                `Student: ${studentName}`
            );

        doc.text(
            `Backup Date: ${new Date().toISOString()}`
        );

        doc.moveDown();

        writeSection(
            "User Profile",
            {
                ...snapshot.user,
                password: "[REDACTED]",
                refreshToken: "[REDACTED]",
            }
        );

        writeSection(
            "Attendance",
            snapshot.attendance
        );

        writeSection(
            "Attendance Activity",
            snapshot.attendanceActivity
        );

        writeSection(
            "Certificate Payments",
            snapshot.certificatePayments
        );

        writeSection(
            "Certificates",
            snapshot.certificates
        );

        writeSection(
            "Feedback",
            snapshot.feedback
        );

        writeSection(
            "Follow Relationships",
            snapshot.follows
        );

        writeSection(
            "Student Internships",
            snapshot.studentInternships
        );

        writeSection(
            "Learning Days",
            snapshot.learningDays
        );

        writeSection(
            "Chat Blocks",
            snapshot.chatBlocks
        );

        writeSection(
            "Chat Mutes",
            snapshot.chatMutes
        );

        writeSection(
            "Messages",
            snapshot.messages
        );

        writeSection(
            "Notifications",
            snapshot.notifications
        );

        writeSection(
            "User Badges",
            snapshot.userBadges
        );

        writeSection(
            "Submissions",
            snapshot.submissions
        );

        writeSection(
            "Support Conversations",
            snapshot.supportConversations
        );

        writeSection(
            "Tasks",
            snapshot.tasks
        );

        writeSection(
            "Activity Logs",
            snapshot.activityLogs
        );

        doc.end();

        stream.on(
            "finish",
            () => resolve(filePath)
        );

        stream.on(
            "error",
            reject
        );
    });

export const createStudentBackup = async (
    user
) => {
    const snapshot =
        await createSnapshot(user);

    const studentName =
        getStudentName(user);

    const safeName =
        getSafeFolderName(studentName);

    const backupFolder =
        path.join(
            process.cwd(),
            "uploads",
            "student-backups",
            safeName
        );

    fs.mkdirSync(
        backupFolder,
        {
            recursive: true,
        }
    );

    const backupFileName =
        `student-backup-${user._id}.pdf`;

    const pdfPath =
        path.join(
            backupFolder,
            backupFileName
        );

    await writeBackupPdf({
        filePath: pdfPath,
        snapshot,
        studentName,
    });

    return {
        snapshot,
        studentName,
        backupFolder,
        pdfPath,
        studentEmail: user.email,
        originalUserId: user._id,
    };
};
