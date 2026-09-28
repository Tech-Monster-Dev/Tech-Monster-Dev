import Attendance from "../../attendance/models/Attendance.js";

const getWeeklyAttendance = async () => {
    const today = new Date();

    const days = [
        "Sun",
        "Mon",
        "Tue",
        "Wed",
        "Thu",
        "Fri",
        "Sat"
    ];
    const weeklyAttendance = [];

    for (let i = 6; i >= 0; i--) {
        const start = new Date(today);
        start.setDate(today.getDate() - i);
        start.setHours(0, 0, 0, 0);
        const end = new Date(start);
        end.setHours(23, 59, 59, 999);

        const attendance = await Attendance.countDocuments({
            createdAt: {
                $gte: start,
                $lte: end
            }
        });

        weeklyAttendance.push({
            day: days[start.getDay()],
            attendance
        });
    }

    return weeklyAttendance;
};

export default getWeeklyAttendance;