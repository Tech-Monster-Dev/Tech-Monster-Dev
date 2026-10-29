import Attendance from "../../attendance/models/Attendance.js";
import User from "../../user/models/User.js";

export const getStudentAttendanceSummary = async ({
    UserModel = User,
    AttendanceModel = Attendance,
    now = new Date()
} = {}) => {
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const studentIds = await UserModel.distinct("_id", {
        role: "student"
    });

    const presentStudents = studentIds.length === 0
        ? []
        : await AttendanceModel.distinct("student", {
            student: {
                $in: studentIds
            },
            status: "Present",
            createdAt: {
                $gte: today,
                $lt: tomorrow
            }
        });

    const totalStudents = studentIds.length;
    const present = presentStudents.length;
    const absent = Math.max(totalStudents - present, 0);
    const attendancePercentage =
        totalStudents === 0
            ? 0
            : Number(
                ((present / totalStudents) * 100).toFixed(1)
            );

    return {
        totalStudents,
        present,
        absent,
        attendancePercentage
    };
};

const getAttendance = async () => {
    const [
        attendanceSummary,
        totalAttendance,
        workingHours
    ] = await Promise.all([
        getStudentAttendanceSummary(),

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
        ...attendanceSummary,
        totalWorkingHours,
        totalWorkingMinutes,
        averageWorkingHours
    };
};

export default getAttendance;
