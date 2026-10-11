import Attendance from "../models/Attendance.js";
import StudentInternship from "../../internships/models/StudentInternship.js";

const getTodayRange = () => {
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

    const start = new Date(
        `${values.year}-${values.month}-${values.day}T00:00:00+05:30`
    );

    return {
        start,
        end: new Date(start.getTime() + 24 * 60 * 60 * 1000 - 1)
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

    const enrollment = await StudentInternship.findOne({
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
        attendanceData.internship = enrollment.internship;
    }

    if (enrollment?.course) {
        attendanceData.course = enrollment.course;
    }

    return Attendance.create(
        attendanceData
    );
};

export default {
    ensureDailyAttendance
};