import Attendance from "../../attendance/models/Attendance.js";

const getDayKey = date => {
    const value = new Date(date);

    value.setHours(0, 0, 0, 0);

    return value.getTime();
};

const getAttendanceDayStreak = (
    attendance,
    accountCreatedAt
) => {

    if (!accountCreatedAt) {
        return 0;
    }

    const presentDays = new Set(
        attendance
            .filter(item => item.status === "Present")
            .map(item => getDayKey(item.createdAt))
    );

    if (presentDays.size === 0) {
        return 0;
    }

    const cursor = new Date();

    cursor.setHours(0, 0, 0, 0);

    const accountDate = new Date(accountCreatedAt);

    accountDate.setHours(0, 0, 0, 0);

    let streak = 0;

    while (cursor >= accountDate) {

        const dayKey = cursor.getTime();

        if (!presentDays.has(dayKey)) {
            break;
        }

        streak++;

        cursor.setDate(
            cursor.getDate() - 1
        );
    }

    return streak;
};

const getAttendance = async (userId) => {

    const attendance = await Attendance.find({

        student: userId

    }).sort({

        createdAt: -1

    });

    const User = (
        await import("../../user/models/User.js")
    ).default;

    const student = await User.findById(
        userId
    ).select("createdAt");

    const dayStreak =
        getAttendanceDayStreak(
            attendance,
            student?.createdAt
        );

    // ==========================
    // Attendance Summary
    // ==========================

    const totalDays = attendance.length;

    const presentDays = attendance.filter(

        item => item.status === "Present"

    ).length;

    const absentDays = attendance.filter(

        item => item.status === "Absent"

    ).length;

    const leaveDays = attendance.filter(

        item => item.status === "Leave"

    ).length;

    const attendancePercentage =

        totalDays === 0

            ? 0

            : Math.round(

                (presentDays / totalDays) * 100

            );

    // ==========================
    // Working Hours
    // ==========================

    const totalHours = attendance.reduce(

        (sum, item) => sum + (item.workingHours || 0),

        0

    );

    const totalMinutes = attendance.reduce(

        (sum, item) => sum + (item.workingMinutes || 0),

        0

    );

    const averageHours =

        totalDays === 0

            ? 0

            : Number(

                (totalHours / totalDays).toFixed(1)

            );

    // ==========================
    // Recent Attendance
    // ==========================

    const recentAttendance = attendance.slice(0, 10).map(item => ({

        _id: item._id,

        date: item.createdAt,

        status: item.status,

        checkIn: item.checkIn,

        checkOut: item.checkOut,

        workingHours: item.workingHours,

        workingMinutes: item.workingMinutes,

        internship: item.internship

    }));

    return {

        summary: {

            totalDays,

            presentDays,

            absentDays,

            leaveDays,

            attendancePercentage,

            totalHours,

            totalMinutes,

            averageHours

        },

        dayStreak,

        recentAttendance

    };

};

export default getAttendance;