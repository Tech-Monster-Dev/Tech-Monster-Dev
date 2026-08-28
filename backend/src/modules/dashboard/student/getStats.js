import Task from "../../tasks/models/Task.js";
import Attendance from "../../attendance/models/Attendance.js";
import LearningDay from "../../learning/models/LearningDay.js";
import AttendanceActivity from "../../attendance/models/AttendanceActivity.js";
import StudentInternship from "../../internships/models/StudentInternship.js";
import UserBadge from "../../profile/models/UserBadge.js";

const getCurrentStreak = learningDays => {

    const qualifiedDays = new Set(
        learningDays
            .filter(day => day.qualified)
            .map(day => {

                const date =
                    new Date(day.date);

                return [
                    date.getFullYear(),
                    date.getMonth(),
                    date.getDate()
                ].join("-");
            })
    );

    if (qualifiedDays.size === 0) {
        return 0;
    }

    const cursor = new Date();

    cursor.setHours(0, 0, 0, 0);

    const todayKey = [
        cursor.getFullYear(),
        cursor.getMonth(),
        cursor.getDate()
    ].join("-");

    /*
     * If today is not qualified yet, start from
     * the most recent qualified day.
     */
    if (!qualifiedDays.has(todayKey)) {

        cursor.setDate(
            cursor.getDate() - 1
        );

        const yesterdayKey = [
            cursor.getFullYear(),
            cursor.getMonth(),
            cursor.getDate()
        ].join("-");

        if (!qualifiedDays.has(yesterdayKey)) {
            return 0;
        }
    }

    let streak = 0;

    while (true) {

        const dayKey = [
            cursor.getFullYear(),
            cursor.getMonth(),
            cursor.getDate()
        ].join("-");

        if (!qualifiedDays.has(dayKey)) {
            break;
        }

        streak++;

        cursor.setDate(
            cursor.getDate() - 1
        );
    }

    return streak;
};

const getStats = async (userId) => {

    const [
        studentPrograms,
        tasks,
        attendance,
        attendanceActivities,
        learningDays,
        badges
    ] = await Promise.all([

        StudentInternship.find({
            student: userId
        }),

        Task.find({
            assignedTo: userId
        }),

        Attendance.find({
            student: userId
        }).sort({
            createdAt: 1
        }),

        AttendanceActivity.find({
            student: userId
        })
            .select("date activeSeconds")
            .sort({
                date: 1
            }),

        LearningDay.find({
            student: userId,
            qualified: true
        })
            .select("date courseSlug lessonIds taskIds qualified")
            .sort({
                date: 1
            }),

        UserBadge.find({
            user: userId
        })

    ]);

    // ==========================
    // Internship / Course Analytics
    // ==========================

    const internships = studentPrograms.filter(
        item => item.internship
    );

    const courses = studentPrograms.filter(
        item => item.course
    );

    // ==========================
    // Internship Analytics
    // ==========================

    const totalInternships = internships.length;

    const completedInternships = internships.filter(
        internship => internship.status === "Completed"
    ).length;

    const internshipProgress =
        totalInternships === 0
            ? 0
            : Math.round(
                (completedInternships / totalInternships) * 100
            );

    // ==========================
    // Course Analytics
    // ==========================

    const totalCourses = courses.length;

    const completedCourses = courses.filter(
        course => course.status === "Completed"
    ).length;

    const courseProgress =
        totalCourses === 0
            ? 0
            : Math.round(
                (completedCourses / totalCourses) * 100
            );

    // ==========================
    // Task Analytics
    // ==========================

    const totalTasks = tasks.length;

    const approvedTasks = tasks.filter(
        task => task.status === "Approved"
    ).length;

    const submittedTasks = tasks.filter(
        task => task.status === "Submitted"
    ).length;

    const incorrectTasks = tasks.filter(
        task => task.status === "Incorrect"
    ).length;

    const pendingTasks = tasks.filter(
        task => task.status === "Pending"
    ).length;

    const taskProgress =
        totalTasks === 0
            ? 0
            : Math.round(
                (approvedTasks / totalTasks) * 100
            );

    // ==========================
    // Attendance Analytics
    // ==========================

    const totalAttendance = attendance.length;

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
        totalAttendance === 0
            ? 0
            : Math.round(
                (presentDays / totalAttendance) * 100
            );

    // ==========================
    // Attendance Streak
    // ==========================

    const currentStreak =
        getCurrentStreak(
            learningDays
        );

    // ==========================
    // Learning Hours
    // ==========================

    const enrollmentStartDates =
        studentPrograms
            .map(item => item.startedAt)
            .filter(Boolean)
            .map(date => new Date(date))
            .filter(date => !Number.isNaN(date.getTime()));

    const earliestEnrollmentDate =
        enrollmentStartDates.length > 0
            ? new Date(
                Math.min(
                    ...enrollmentStartDates.map(
                        date => date.getTime()
                    )
                )
            )
            : null;

    const learningSeconds =
        attendanceActivities.reduce(
            (sum, item) => {

                const activityDate =
                    new Date(item.date);

                if (
                    earliestEnrollmentDate &&
                    activityDate >= earliestEnrollmentDate
                ) {
                    return sum +
                        Number(
                            item.activeSeconds || 0
                        );
                }

                return sum;
            },
            0
        );

    const totalLearningHours =
        Number(
            (
                learningSeconds / 3600
            ).toFixed(2)
        );

    // ==========================
    // Return Stats
    // ==========================

    return {

        internships: {
            total: totalInternships,
            completed: completedInternships,
            progress: internshipProgress
        },

        courses: {
            total: totalCourses,
            completed: completedCourses,
            progress: courseProgress
        },

        tasks: {
            total: totalTasks,
            approved: approvedTasks,
            submitted: submittedTasks,
            incorrect: incorrectTasks,
            pending: pendingTasks,
            progress: taskProgress
        },

        attendance: {
            total: totalAttendance,
            present: presentDays,
            absent: absentDays,
            leave: leaveDays,
            percentage: attendancePercentage
        },

        learning: {
            totalHours: totalLearningHours
        },

        badges: badges.length,

        streak: currentStreak

    };

};

export default getStats;
