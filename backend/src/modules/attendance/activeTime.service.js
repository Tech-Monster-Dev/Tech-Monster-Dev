import AttendanceActivity from "./models/AttendanceActivity.js";
import StudentInternship from "../internships/models/StudentInternship.js";
import UserBadge from "../profile/models/UserBadge.js";
import Badge from "../profile/models/Badges.js";
import User from "../user/models/User.js";
import { sendBadgeEarnedEmail } from "../../infrastructure/email/services/badgeEarnedEmail.service.js";

const getTodayStart = () => {
    const parts = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
    }).formatToParts(new Date());

    const values = Object.fromEntries(
        parts
            .filter(({ type }) => type !== "literal")
            .map(({ type, value }) => [type, value])
    );

    return new Date(values["year"] + "-" + values["month"] + "-" + values["day"] + "T00:00:00+05:30");
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

    const student = await User.findById(userId).select("firstName lastName username email");

    if (!student?.email) {
        return;
    }

    for (const definition of DAILY_TIME_BADGES) {
        const requiredSeconds = definition.hours * 60 * 60;

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
    activeSeconds = 0,
    dateKey = null
) => {
    if (!userId || !Number.isFinite(activeSeconds)) {
        return null;
    }

    const seconds = Math.max(
        0,
        Math.min(Math.floor(activeSeconds), 120)
    );

    if (seconds === 0) {
        return null;
    }

    let date = getTodayStart();

    if (dateKey !== null) {
        if (
            typeof dateKey !== "string" ||
            !/^\d{4}-\d{2}-\d{2}$/.test(dateKey)
        ) {
            return null;
        }

        const parsedDate = new Date(
            `${dateKey}T00:00:00+05:30`
        );

        if (Number.isNaN(parsedDate.getTime())) {
            return null;
        }

        const parts = new Intl.DateTimeFormat("en-CA", {
            timeZone: "Asia/Kolkata",
            year: "numeric",
            month: "2-digit",
            day: "2-digit"
        }).formatToParts(parsedDate);

        const values = Object.fromEntries(
            parts
                .filter(({ type }) => type !== "literal")
                .map(({ type, value }) => [type, value])
        );

        const parsedDateKey =
            `${values.year}-${values.month}-${values.day}`;

        if (parsedDateKey !== dateKey) {
            return null;
        }

        date = parsedDate;
    }

    const activity = await AttendanceActivity.findOneAndUpdate(
        {
            student: userId,
            date,
            course: null,
            internship: null
        },
        {
            $inc: { activeSeconds: seconds },
            $setOnInsert: {
                student: userId,
                date,
                course: null,
                internship: null
            }
        },
        {
            new: true,
            upsert: true,
            setDefaultsOnInsert: true
        }
    );

    const dailyActivities = await AttendanceActivity.find({
        student: userId,
        date
    }).select("activeSeconds");

    const totalSeconds = dailyActivities.reduce(
        (total, item) => total + (item.activeSeconds || 0),
        0
    );

    await unlockDailyTimeBadges(userId, totalSeconds);

    activity.activeSeconds = totalSeconds;

    return activity;
};

export const getTodayActiveTime = async (userId) => {
    if (!userId) {
        return 0;
    }

    const date = getTodayStart();

    const dailyActivities = await AttendanceActivity.find({
        student: userId,
        date
    }).select("activeSeconds");

    return dailyActivities.reduce(
        (total, item) => total + (item.activeSeconds || 0),
        0
    );
};

export default {
    recordActiveTime,
    getTodayActiveTime
};