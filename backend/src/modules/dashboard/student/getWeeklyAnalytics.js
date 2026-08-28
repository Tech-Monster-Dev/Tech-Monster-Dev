import Attendance from "../../attendance/models/Attendance.js";
import AttendanceActivity from "../../attendance/models/AttendanceActivity.js";
import Task from "../../tasks/models/Task.js";
import StudentInternship from "../../internships/models/StudentInternship.js";

const DAYS = [
    "Sun",
    "Mon",
    "Tue",
    "Wed",
    "Thu",
    "Fri",
    "Sat"
];

const getDayKey = date => {
    const value = new Date(date);

    value.setHours(0, 0, 0, 0);

    return value;
};

const getStartOfWeek = date => {
    const value = getDayKey(date);

    value.setDate(
        value.getDate() - value.getDay()
    );

    return value;
};

const getEndOfWeek = date => {
    const value = getStartOfWeek(date);

    value.setDate(
        value.getDate() + 6
    );

    value.setHours(23, 59, 59, 999);

    return value;
};

const getWeeklyAnalytics = async userId => {

    const now = new Date();

    const currentWeekStart =
        getStartOfWeek(now);

    const currentWeekEnd =
        getEndOfWeek(now);

    const previousWeekStart =
        new Date(currentWeekStart);

    previousWeekStart.setDate(
        previousWeekStart.getDate() - 7
    );

    const previousWeekEnd =
        new Date(currentWeekStart);

    previousWeekEnd.setMilliseconds(-1);

    const [
        attendance,
        tasks,
        internships,
        currentWeekActivity,
        previousWeekActivity
    ] = await Promise.all([

        Attendance.find({
            student: userId
        }).select("createdAt status"),

        Task.find({
            assignedTo: userId
        }).select("status updatedAt"),

        StudentInternship.find({
            student: userId
        }).select(
            "internship course progress status startedAt"
        ),

        AttendanceActivity.find({
            student: userId,
            date: {
                $gte: currentWeekStart,
                $lte: currentWeekEnd
            }
        }).select("date activeSeconds"),

        AttendanceActivity.find({
            student: userId,
            date: {
                $gte: previousWeekStart,
                $lte: previousWeekEnd
            }
        }).select("date activeSeconds")
    ]);

    // ==========================================
    // LEARNING ENROLLMENT BOUNDARY
    // ==========================================

    const enrollmentStartDates =
        internships
            .map(item => item.startedAt)
            .filter(Boolean)
            .map(date => new Date(date))
            .filter(date => !Number.isNaN(date.getTime()));

    const earliestEnrollmentDate =
        enrollmentStartDates.length > 0
            ? getDayKey(
                new Date(
                    Math.min(
                        ...enrollmentStartDates.map(
                            date => date.getTime()
                        )
                    )
                )
            )
            : null;

    const enrolledCurrentWeekActivity =
        earliestEnrollmentDate
            ? currentWeekActivity.filter(
                item =>
                    new Date(item.date) >=
                    earliestEnrollmentDate
            )
            : [];

    const learningActivity =
        earliestEnrollmentDate
            ? currentWeekActivity.filter(
                item =>
                    new Date(item.date) >=
                    earliestEnrollmentDate
            )
            : [];

    const previousLearningActivity =
        earliestEnrollmentDate
            ? previousWeekActivity.filter(
                item =>
                    new Date(item.date) >=
                    earliestEnrollmentDate
            )
            : [];

    // ==========================================
    // WEEKLY ATTENDANCE
    // ==========================================

    const attendanceData =
        new Array(7).fill(0);

    attendance.forEach(item => {

        const date =
            new Date(item.createdAt);

        if (
            date < currentWeekStart ||
            date > currentWeekEnd
        ) {
            return;
        }

        if (item.status !== "Present") {
            return;
        }

        attendanceData[
            date.getDay()
        ]++;
    });

    // ==========================================
    // WEEKLY LEARNING HOURS
    // ==========================================

    const learningHours =
        new Array(7).fill(0);

    learningActivity.forEach(item => {

        const day =
            new Date(item.date).getDay();

        learningHours[day] +=
            (item.activeSeconds || 0) / 3600;
    });

    const totalCurrentWeekSeconds =
        learningActivity.reduce(
            (sum, item) =>
                sum +
                (item.activeSeconds || 0),
            0
        );

    const totalPreviousWeekSeconds =
        previousLearningActivity.reduce(
            (sum, item) =>
                sum +
                (item.activeSeconds || 0),
            0
        );

    // ==========================================
    // WEEKLY LEARNING CHART
    // ==========================================

    const maxDailySeconds =
        Math.max(
            ...learningActivity.map(
                item => item.activeSeconds || 0
            ),
            0
        );

    const weeklyData =
        maxDailySeconds === 0
            ? new Array(7).fill(0)
            : learningHours.map(hours => {

                const seconds =
                    hours * 3600;

                return Math.round(
                    (seconds /
                        maxDailySeconds) *
                    100
                );
            });

    // ==========================================
    // COMPLETED TASKS
    // ==========================================

    const completedTasks =
        new Array(7).fill(0);

    tasks
        .filter(
            task =>
                task.status === "Approved" &&
                new Date(task.updatedAt) >=
                    currentWeekStart &&
                new Date(task.updatedAt) <=
                    currentWeekEnd
        )
        .forEach(task => {

            const day =
                new Date(task.updatedAt).getDay();

            completedTasks[day]++;
        });

    // ==========================================
    // INTERNSHIP PROGRESS
    // ==========================================

    const internshipProgress =
        internships.map(item => ({

            internship:
                item.internship,

            progress:
                item.progress,

            status:
                item.status
        }));

    // ==========================================
    // COMPLETED PROGRAMS
    // ==========================================

    const completedCourses =
        internships.filter(
            item =>
                item.status === "Completed"
        ).length;

    // ==========================================
    // WEEKLY LEARNING GOAL
    // ==========================================

    /*
     * Weekly target:
     * 1 hour of learning per day × 7 days = 7 hours.
     *
     * 7 hours or more = 100%.
     * Below 7 hours = proportional percentage.
     */

    const weeklyLearningTargetSeconds =
        7 * 60 * 60;

    const growth =
        Math.min(
            Math.round(
                (
                    totalCurrentWeekSeconds /
                    weeklyLearningTargetSeconds
                ) * 100
            ),
            100
        );

    // ==========================================
    // TOTAL LEARNING HOURS
    // ==========================================

    const hours =
        Number(
            (
                totalCurrentWeekSeconds /
                3600
            ).toFixed(1)
        );

    return {

        labels: DAYS,

        attendance:
            attendanceData,

        learningHours:
            learningHours.map(
                value =>
                    Number(
                        value.toFixed(2)
                    )
            ),

        completedTasks,

        internshipProgress,

        // Home page analytics
        completedCourses,

        hours,

        growth,

        weeklyData
    };
};

export default getWeeklyAnalytics;
