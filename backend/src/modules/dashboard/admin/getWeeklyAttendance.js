import Attendance from "../../attendance/models/Attendance.js";
import User from "../../user/models/User.js";

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

    const studentIds = await User.find({ role: "student" }).distinct("_id");
    const totalStudents = studentIds.length;

    const weeklyAttendance = [];

    for (let i = 6; i >= 0; i--) {
        const start = new Date(today);
        start.setDate(today.getDate() - i);
        start.setHours(0, 0, 0, 0);

        const end = new Date(start);
        end.setDate(start.getDate() + 1);

        const presentStudents = await Attendance.distinct(
            "student",
            {
                student: { $in: studentIds },
                status: "Present",
                createdAt: {
                    $gte: start,
                    $lt: end
                }
            }
        );

        const present = presentStudents.length;

        const absent = Math.max(
            totalStudents - present,
            0
        );

        weeklyAttendance.push({
            day: days[start.getDay()],
            present,
            absent
        });
    }

    return weeklyAttendance;
};

export default getWeeklyAttendance;
