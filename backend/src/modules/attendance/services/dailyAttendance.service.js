import Attendance from "../models/Attendance.js";
import StudentInternship from "../../internships/models/StudentInternship.js";

const getTodayRange = () => {
    const start = new Date();

    start.setHours(0, 0, 0, 0);

    const end = new Date(start);

    end.setHours(23, 59, 59, 999);

    return {
        start,
        end
    };
};

export const ensureDailyAttendance = async (
    userId
) => {
    const {
        start,
        end
    } = getTodayRange();

    const existing = await Attendance.findOne({
        student: userId,
        createdAt: {
            $gte: start,
            $lte: end
        }
    });

    if (existing) {
        return existing;
    }

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

    const attendanceData = {
        student: userId,
        status: "Present"
    };

    if (enrollment?.internship) {
        attendanceData.internship =
            enrollment.internship;
    }

    if (enrollment?.course) {
        attendanceData.course =
            enrollment.course;
    }

    return Attendance.create(
        attendanceData
    );
};

export default {
    ensureDailyAttendance
};
