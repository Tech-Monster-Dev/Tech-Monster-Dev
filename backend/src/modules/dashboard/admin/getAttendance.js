import Attendance from "../../attendance/models/Attendance.js";
import User from "../../user/models/User.js";

const getAttendance = async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [
        totalStudents,
        presentStudents,
        totalAttendance,
        workingHours
    ] = await Promise.all([
        User.countDocuments({
            role: "student"
        }),

        Attendance.distinct("student", {
            status: "Present",
            createdAt: {
                $gte: today,
                $lt: tomorrow
            }
        }),

        Attendance.countDocuments(),

        Attendance.aggregate([
            {
                $group: {
                    _id: null,
                    totalHours: {
                        $sum: "$workingHours"
                    },
                    totalMinutes: {
                        $sum: "$workingMinutes"
                    }
                }
            }
        ])
    ]);

    const present = presentStudents.length;

    const absent = Math.max(
        totalStudents - present,
        0
    );

    const attendancePercentage =
        totalStudents === 0
            ? 0
            : Number(
                ((present / totalStudents) * 100).toFixed(1)
            );

    const totalWorkingHours =
        workingHours.length > 0
            ? workingHours[0].totalHours
            : 0;

    const totalWorkingMinutes =
        workingHours.length > 0
            ? workingHours[0].totalMinutes
            : 0;

    const averageWorkingHours =
        totalAttendance === 0
            ? 0
            : Number(
                (totalWorkingHours / totalAttendance).toFixed(1)
            );

    return {
        totalStudents,
        present,
        absent,
        attendancePercentage,
        totalWorkingHours,
        totalWorkingMinutes,
        averageWorkingHours
    };
};

export default getAttendance;
