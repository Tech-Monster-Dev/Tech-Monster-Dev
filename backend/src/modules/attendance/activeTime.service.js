import AttendanceActivity from "./models/AttendanceActivity.js";
import StudentInternship from "../internships/models/StudentInternship.js";
import UserBadge from "../profile/models/UserBadge.js";
import Badge from "../profile/models/Badges.js";
import User from "../user/models/User.js";
import { sendBadgeEarnedEmail } from "../../infrastructure/email/services/badgeEarnedEmail.service.js";

const getTodayStart = () => {
    const date = new Date();

    date.setHours(0, 0, 0, 0);

    return date;
};

const DAILY_TIME_BADGES = [
    {
        hours: 4,
        title: "4 Hour Dedicated",
        icon: "4H",
        description: "Used Tech Monster for 4+ active hours in one day.",
        requirement: "4+ active hours in one day"
    },
    {
        hours: 7,
        title: "7 Hour Warrior",
        icon: "7H",
        description: "Used Tech Monster for 7+ active hours in one day.",
        requirement: "7+ active hours in one day"
    },
    {
        hours: 10,
        title: "10 Hour Champion",
        icon: "10H",
        description: "Used Tech Monster for 10+ active hours in one day.",
        requirement: "10+ active hours in one day"
    }
];

const unlockDailyTimeBadges = async (
    userId,
    activeSeconds
) => {

    const student = await User.findById(userId)
        .select("firstName lastName username email");

    if (!student?.email) {
        return;
    }

    for (const definition of DAILY_TIME_BADGES) {

        const requiredSeconds =
            definition.hours * 60 * 60;

        if (activeSeconds < requiredSeconds) {
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

        const today = getTodayStart();

        const existing = await UserBadge.findOne({
            user: userId,
            badge: badge._id,
            earnedDate: today
        });

        if (existing) {
            continue;
        }

        const earnedAt = new Date();

        await UserBadge.create({
            user: userId,
            badge: badge._id,
            earnedAt,
            earnedDate: today
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

export const recordActiveTime = async (
    userId,
    activeSeconds = 0
) => {

    if (!userId || !Number.isFinite(activeSeconds)) {
        return null;
    }

    const seconds = Math.max(
        0,
        Math.min(
            Math.floor(activeSeconds),
            120
        )
    );

    if (seconds === 0) {
        return null;
    }

    const date = getTodayStart();

    const enrollment =
        await StudentInternship.findOne({
            student: userId,
            status: "In Progress",
            $or: [
                {
                    internship: {
                        $exists: true,
                        $ne: null
                    }
                },
                {
                    course: {
                        $exists: true,
                        $ne: null
                    }
                }
            ]
        }).sort({
            createdAt: -1
        });

    if (!enrollment) {
        return null;
    }

    const activityFilter = {
        student: userId,
        date
    };

    const activityUpdate = {
        $inc: {
            activeSeconds: seconds
        },
        $set: {
            course:
                enrollment.course || null,

            internship:
                enrollment.internship || null
        }
    };

    const activity =
        await AttendanceActivity.findOneAndUpdate(
            activityFilter,
            activityUpdate,
            {
                new: true,
                upsert: true,
                setDefaultsOnInsert: true
            }
        );

    await unlockDailyTimeBadges(
        userId,
        activity.activeSeconds || 0
    );

    return activity;
};

export const getTodayActiveTime = async (
    userId
) => {

    if (!userId) {
        return 0;
    }

    const date = getTodayStart();

    const enrollment =
        await StudentInternship.findOne({
            student: userId,
            status: "In Progress",
            $or: [
                {
                    internship: {
                        $exists: true,
                        $ne: null
                    }
                },
                {
                    course: {
                        $exists: true,
                        $ne: null
                    }
                }
            ]
        }).sort({
            createdAt: -1
        });

    if (!enrollment) {
        return 0;
    }

    const activityQuery = {
        student: userId,
        date,
        course:
            enrollment.course || null,
        internship:
            enrollment.internship || null
    };

    const activity =
        await AttendanceActivity.findOne(
            activityQuery
        );

    return activity?.activeSeconds || 0;
};

export default {
    recordActiveTime,
    getTodayActiveTime
};
