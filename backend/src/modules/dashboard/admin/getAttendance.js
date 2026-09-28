import Attendance from "../../attendance/models/Attendance.js";

const getAttendance = async () => {
    const [
        totalAttendance,
        present,
        absent,
        leave,
        workingHours
    ] = await Promise.all([
        Attendance.countDocuments(),
        Attendance.countDocuments({
            status: "Present"
        }),

        Attendance.countDocuments({
            status: "Absent"
        }),

        Attendance.countDocuments({
            status: "Leave"
        }),

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

    // ==========================
    // Attendance Percentage
    // ==========================
    const attendancePercentage =
        totalAttendance === 0
            ? 0
            : Number(
                (
                    (present / totalAttendance) * 100
                ).toFixed(1)
            );

    // ==========================
    // Working Hours
    // ==========================
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
                (
                    totalWorkingHours /
                    totalAttendance
                ).toFixed(1)
            );

    return {
        totalAttendance,
        present,
        absent,
        leave,
        attendancePercentage,
        totalWorkingHours,
        totalWorkingMinutes,
        averageWorkingHours
    };
};

export default getAttendance;