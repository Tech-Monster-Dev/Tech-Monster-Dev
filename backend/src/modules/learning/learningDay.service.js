import LearningDay from "./models/LearningDay.js";
import Submission from "../submissions/models/Submission.js";
import { readCourseData } from "../submissions/utils/courseData.utils.js";

const getDayStart = date => {
    const value = new Date(date);

    value.setHours(0, 0, 0, 0);

    return value;
};

export const recordLessonLearningDay = async ({
    studentId,
    courseSlug,
    courseId = null,
    internshipId = null,
    lessonId,
    startedAt
}) => {

    if (
        !studentId ||
        !courseSlug ||
        !lessonId ||
        !startedAt
    ) {
        return null;
    }

    const learningDate =
        getDayStart(new Date());

    const enrollmentDate =
        getDayStart(new Date(startedAt));

    if (learningDate < enrollmentDate) {
        return null;
    }

    return LearningDay.findOneAndUpdate(
        {
            student: studentId,
            courseSlug,
            date: learningDate
        },
        {
            $setOnInsert: {
                student: studentId,
                course: courseId,
                internship: internshipId,
                courseSlug,
                date: learningDate
            },
            $addToSet: {
                lessonIds: String(lessonId)
            }
        },
        {
            new: true,
            upsert: true,
            setDefaultsOnInsert: true
        }
    );
};

export default {
    recordLessonLearningDay
};

export const qualifyLearningDay = async ({
    studentId,
    courseSlug,
    courseId = null,
    internshipId = null,
    lessonId,
    taskId,
    approvedAt
}) => {

    if (
        !studentId ||
        !courseSlug ||
        !lessonId ||
        !taskId
    ) {
        return null;
    }

    const learningDate =
        getDayStart(
            approvedAt || new Date()
        );

    const learningDay =
        await LearningDay.findOne({
            student: studentId,
            courseSlug,
            date: learningDate
        });

    if (!learningDay) {
        return null;
    }

    if (
        !learningDay.lessonIds.includes(
            String(lessonId)
        )
    ) {
        return null;
    }

    const courseData =
        await readCourseData(courseSlug);

    const lesson =
        (courseData?.modules || [])
            .flatMap(module =>
                module.lessons || []
            )
            .find(item =>
                String(item.lessonId || "") ===
                String(lessonId)
            );

    if (!lesson) {
        return null;
    }

    const requiredTaskIds =
        (lesson.tasks || [])
            .map(task =>
                String(task.taskId || "")
            )
            .filter(Boolean);

    if (
        requiredTaskIds.length === 0 ||
        !requiredTaskIds.includes(
            String(taskId)
        )
    ) {
        return null;
    }

    const approvedTasks =
        await Submission.find({
            student: studentId,
            courseSlug,
            lessonId: String(lessonId),
            status: "approved",
            taskId: {
                $in: requiredTaskIds
            }
        }).select("taskId");

    const approvedTaskIds =
        new Set(
            approvedTasks.map(item =>
                String(item.taskId)
            )
        );

    const allRequiredTasksApproved =
        requiredTaskIds.every(
            requiredId =>
                approvedTaskIds.has(
                    requiredId
                )
        );

    if (!learningDay.taskIds.includes(
        String(taskId)
    )) {
        learningDay.taskIds.push(
            String(taskId)
        );
    }

    learningDay.qualified =
        learningDay.lessonIds.length > 0 &&
        allRequiredTasksApproved;

    if (courseId) {
        learningDay.course = courseId;
    }

    if (internshipId) {
        learningDay.internship = internshipId;
    }

    await learningDay.save();

    return learningDay;
};
