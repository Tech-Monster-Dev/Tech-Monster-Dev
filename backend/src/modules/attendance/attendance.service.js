import Attendance from "./models/Attendance.js";
import StudentInternship from "../internships/models/StudentInternship.js";
import logActivity from "../activity/logActivity.js";
import UserBadge from "../profile/models/UserBadge.js";
import Badge from "../profile/models/Badges.js";
import User from "../user/models/User.js";
import { sendBadgeEarnedEmail } from "../../infrastructure/email/services/badgeEarnedEmail.service.js";

const getTodayRange = () => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setHours(23, 59, 59, 999);

    return { start, end };
};

const ATTENDANCE_STREAK_BADGES = [
    {
        days: 7,
        title: "7 Days Present",
        icon: "7D",
        description: "Present for 7 consecutive days.",
        requirement: "7 consecutive present days"
    },
    {
        days: 11,
        title: "11 Days Present",
        icon: "11D",
        description: "Present for 11 consecutive days.",
        requirement: "11 consecutive present days"
    },
    {
        days: 30,
        title: "30 Days Present",
        icon: "30D",
        description: "Present for 30 consecutive days.",
        requirement: "30 consecutive present days"
    },
    {
        days: 90,
        title: "90 Days Present",
        icon: "90D",
        description: "Present for 90 consecutive days.",
        requirement: "90 consecutive present days"
    }
];

const getCurrentAttendanceStreak = async (userId) => {

    const records = await Attendance.find({
        student: userId,
        status: "Present"
    })
        .select("createdAt")
        .sort({
            createdAt: -1
        });

    if (!records.length) {
        return 0;
    }

    const presentDays = new Set(
        records.map(record =>
            new Date(record.createdAt)
                .toISOString()
                .slice(0, 10)
        )
    );

    let streak = 0;
    const cursor = new Date();

    cursor.setHours(0, 0, 0, 0);

    while (presentDays.has(
        cursor.toISOString().slice(0, 10)
    )) {

        streak++;

        cursor.setDate(
            cursor.getDate() - 1
        );
    }

    return streak;
};

const unlockAttendanceStreakBadges = async (
    userId,
    streak
) => {

    const student = await User.findById(userId)
        .select("firstName lastName username email");

    if (!student?.email) {
        return;
    }

    for (const definition of ATTENDANCE_STREAK_BADGES) {

        if (streak < definition.days) {
            continue;
        }

        let badge = await Badge.findOne({
            title: definition.title,
            category: "ATTENDANCE"
        });

        if (!badge) {
            badge = await Badge.create({
                title: definition.title,
                icon: definition.icon,
                description: definition.description,
                requirement: definition.requirement,
                category: "ATTENDANCE"
            });
        }

        const existing = await UserBadge.findOne({
            user: userId,
            badge: badge._id
        });

        if (existing) {
            continue;
        }

        const earnedAt = new Date();
        const earnedDate = getTodayRange().start;

        await UserBadge.create({
            user: userId,
            badge: badge._id,
            earnedAt,
            earnedDate
        });

        try {
            await sendBadgeEarnedEmail({
                student,
                badge: {
                    ...badge.toObject(),
                    earnedAt
                }
            });
        } catch (error) {
            console.error(
                "Badge earned email failed:",
                error
            );
        }
    }
};
