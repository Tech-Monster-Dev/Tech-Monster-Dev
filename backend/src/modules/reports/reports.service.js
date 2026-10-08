import ActivityLog from "../activity/models/ActivityLog.js";
import Attendance from "../attendance/models/Attendance.js";
import User from "../user/models/User.js";

const TIME_ZONE = "Asia/Kolkata";

const getDayKey = (date) =>
    new Intl.DateTimeFormat("en-CA", {
        timeZone: TIME_ZONE,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).format(date);

const getMonthKey = (date) =>
    new Intl.DateTimeFormat("en-CA", {
        timeZone: TIME_ZONE,
        year: "numeric",
        month: "2-digit",
    }).format(date);

const getStartOfDay = (date) => {
    const parts = new Intl.DateTimeFormat("en-CA", {
        timeZone: TIME_ZONE,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).formatToParts(date);

    const values = Object.fromEntries(
        parts
            .filter(({ type }) => type !== "literal")
            .map(({ type, value }) => [type, Number(value)])
    );

    return new Date(
        `${values.year}-${String(values.month).padStart(2, "0")}-${String(values.day).padStart(2, "0")}T00:00:00+05:30`
    );
};

const getMonthRange = (year, month) => {
    const start = new Date(
        `${year}-${String(month).padStart(2, "0")}-01T00:00:00+05:30`
    );

    const end = new Date(start);
    end.setMonth(end.getMonth() + 1);

    return { start, end };
};

const getWeekRange = (date = new Date()) => {
    const current = getStartOfDay(date);
    const day = current.getDay();
    const mondayOffset = day === 0 ? -6 : 1 - day;

    const start = new Date(current);
    start.setDate(start.getDate() + mondayOffset);

    const end = new Date(start);
    end.setDate(end.getDate() + 7);

    return { start, end };
};

const getUserProjection = {
    _id: 1,
    firstName: 1,
    middleName: 1,
    lastName: 1,
    username: 1,
    email: 1,
    avatar: 1,
};

const getStudentIds = async () => {
    const students = await User.find({ role: "student" })
        .select("_id")
        .lean();

    return students.map((student) => student._id);
};

const getDailyAnalytics = async (date = new Date()) => {
    const start = getStartOfDay(date);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    const studentIds = await getStudentIds();

    const attendance = await Attendance.find({
        student: { $in: studentIds },
        status: "Present",
        createdAt: {
            $gte: start,
            $lt: end,
        },
    })
        .populate("student", getUserProjection)
        .sort({ createdAt: 1 })
        .lean();

    const students = new Map();

    attendance.forEach((record) => {
        if (record.student?._id) {
            students.set(String(record.student._id), record.student);
        }
    });

    return {
        date: getDayKey(start),
        totalStudents: studentIds.length,
        totalPresent: students.size,
        totalAbsent: Math.max(studentIds.length - students.size, 0),
        users: Array.from(students.values()),
    };
};

const getWeeklyAnalytics = async (date = new Date()) => {
    const { start, end } = getWeekRange(date);

    const studentIds = await getStudentIds();

    const attendance = await Attendance.find({
        student: { $in: studentIds },
        status: "Present",
        createdAt: {
            $gte: start,
            $lt: end,
        },
    })
        .populate("student", getUserProjection)
        .lean();

    const dailyMap = new Map();

    for (let index = 0; index < 7; index += 1) {
        const day = new Date(start);
        day.setDate(start.getDate() + index);

        dailyMap.set(getDayKey(day), {
            date: getDayKey(day),
            present: 0,
            users: new Map(),
        });
    }

    attendance.forEach((record) => {
        if (!record.student?._id) return;

        const key = getDayKey(record.createdAt);
        const day = dailyMap.get(key);

        if (!day) return;

        const userId = String(record.student._id);

        if (!day.users.has(userId)) {
            day.users.set(userId, record.student);
            day.present += 1;
        }
    });

    const days = Array.from(dailyMap.values()).map((day) => ({
        date: day.date,
        present: day.present,
    }));

    const userDays = new Map();

    dailyMap.forEach((day) => {
        day.users.forEach((user) => {
            const userId = String(user._id);

            if (!userDays.has(userId)) {
                userDays.set(userId, {
                    user,
                    days: 0,
                });
            }

            userDays.get(userId).days += 1;
        });
    });

    const today = getStartOfDay(new Date());
    const isCurrentWeek = today >= start && today < end;
    const daysToCheck = isCurrentWeek
        ? Math.floor((today.getTime() - start.getTime()) / 86400000) + 1
        : 7;

    const usersPresentEveryDay = Array.from(userDays.values())
        .filter((item) => item.days === daysToCheck)
        .map((item) => item.user);

    return {
        startDate: getDayKey(start),
        endDate: getDayKey(new Date(end.getTime() - 1)),
        days,
        users: usersPresentEveryDay,
    };
};

const getMonthlyAnalytics = async (year, month) => {
    const { start, end } = getMonthRange(year, month);

    const studentIds = await getStudentIds();

    const attendance = await Attendance.find({
        student: { $in: studentIds },
        status: "Present",
        createdAt: {
            $gte: start,
            $lt: end,
        },
    })
        .populate("student", getUserProjection)
        .lean();

    const dailyMap = new Map();
    const users = new Map();

    attendance.forEach((record) => {
        if (!record.student?._id) return;

        const userId = String(record.student._id);
        const dateKey = getDayKey(record.createdAt);

        if (!dailyMap.has(dateKey)) {
            dailyMap.set(dateKey, new Set());
        }

        dailyMap.get(dateKey).add(userId);

        if (!users.has(userId)) {
            users.set(userId, {
                user: record.student,
                days: new Set(),
            });
        }

        users.get(userId).days.add(dateKey);
    });

    const today = getStartOfDay(new Date());
    const isCurrentMonth = today >= start && today < end;
    const daysToCheck = isCurrentMonth
        ? Math.floor((today.getTime() - start.getTime()) / 86400000) + 1
        : 20;

    const qualifyingUsers = Array.from(users.values())
        .filter((item) =>
            isCurrentMonth
                ? item.days.size === daysToCheck
                : item.days.size >= daysToCheck
        )
        .map((item) => ({
            ...item.user,
            presentDays: item.days.size,
        }));

    const chart = Array.from(dailyMap.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, studentIds]) => ({
            date,
            present: studentIds.size,
        }));

    return {
        year,
        month,
        totalPresentUsers: users.size,
        qualifyingUsers,
        chart,
    };
};

const getYearlyAnalytics = async (year) => {
    const start = new Date(
        `${year}-01-01T00:00:00+05:30`
    );

    const end = new Date(
        `${year + 1}-01-01T00:00:00+05:30`
    );

    const studentIds = await getStudentIds();

    const attendance = await Attendance.find({
        student: { $in: studentIds },
        status: "Present",
        createdAt: {
            $gte: start,
            $lt: end,
        },
    })
        .select("student createdAt")
        .lean();

    const monthlyMap = new Map();

    for (let month = 1; month <= 12; month += 1) {
        monthlyMap.set(
            `${year}-${String(month).padStart(2, "0")}`,
            new Set()
        );
    }

    attendance.forEach((record) => {
        if (!record.student) return;

        const monthKey = getMonthKey(record.createdAt);
        const students = monthlyMap.get(monthKey);

        if (students) {
            students.add(String(record.student));
        }
    });

    const chart = Array.from(monthlyMap.entries()).map(
        ([month, students]) => ({
            month,
            present: students.size,
        })
    );

    return {
        year,
        chart,
    };
};

const getAvailableReportYears = async () => {
    const currentYear = new Date().getFullYear();

    const earliestRecord = await Attendance.findOne({
        student: { $exists: true, $ne: null },
        status: "Present",
    })
        .sort({ createdAt: 1 })
        .select("createdAt")
        .lean();

    const earliestYear = earliestRecord?.createdAt
        ? new Date(earliestRecord.createdAt).getFullYear()
        : currentYear;

    return Array.from(
        { length: currentYear - earliestYear + 1 },
        (_, index) => earliestYear + index
    );
};

const getMonthlyNewUsers = async (year, month) => {
    const { start, end } = getMonthRange(year, month);

    const activities = await ActivityLog.find({
        createdAt: {
            $gte: start,
            $lt: end,
        },
    })
        .select("user")
        .sort({ createdAt: -1 })
        .lean();

    const userIds = [
        ...new Set(
            activities
                .map((activity) => String(activity.user))
                .filter(Boolean)
        ),
    ];

    if (!userIds.length) {
        return [];
    }

    return User.find({
        _id: { $in: userIds },
        role: "student",
    })
        .select(getUserProjection)
        .sort({ createdAt: -1 })
        .lean();
};

const getUserMonthlyActivities = async (userId, year, month) => {
    const { start, end } = getMonthRange(year, month);

    return ActivityLog.find({
        user: userId,
        createdAt: {
            $gte: start,
            $lt: end,
        },
    })
        .sort({ createdAt: -1 })
        .lean();
};

export {
    getDailyAnalytics,
    getWeeklyAnalytics,
    getMonthlyAnalytics,
    getYearlyAnalytics,
    getAvailableReportYears,
    getMonthlyNewUsers,
    getUserMonthlyActivities,
};