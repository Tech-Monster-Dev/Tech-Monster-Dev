import Submission from "../models/Submission.js";

import AppError from "../../../core/errors/AppError.js";

import {
    readCourseData,
    getOrderedCourseTasks,
} from "../utils/courseTask.utils.js";

export const buildNewSubmission =
    async ({
        req,
        course,
        internship,
        normalizedCourseSlug,
        normalizedLessonId,
        moduleId,
        taskId,
        moduleTitle,
        taskTitle,
        problemStatement,
        code,
        answer,
        githubLink,
        liveLink,
    }) => {
        const courseData =
            await readCourseData(
                normalizedCourseSlug
            );

        const orderedTasks =
            getOrderedCourseTasks(
                courseData
            );

        const requestedTask =
            orderedTasks.find(
                (task) =>
                    task.moduleId ===
                        moduleId &&
                    String(
                        task.lessonId ||
                        ""
                    ) ===
                        normalizedLessonId &&
                    task.taskId ===
                        taskId
            );

        if (!requestedTask) {
            throw new AppError(
                "Task not found.",
                404
            );
        }

        const index =
            orderedTasks.findIndex(
                (task) =>
                    task.moduleId ===
                        requestedTask.moduleId &&
                    String(
                        task.lessonId ||
                        ""
                    ) ===
                        String(
                            requestedTask.lessonId ||
                            ""
                        ) &&
                    task.taskId ===
                        requestedTask.taskId
            );

        const previousTask =
            index > 0
                ? orderedTasks[index - 1]
                : null;

        if (previousTask) {
            const previous =
                await Submission.findOne({
                    student:
                        req.user._id,

                    courseSlug:
                        normalizedCourseSlug,

                    moduleId:
                        previousTask.moduleId,

                    lessonId:
                        String(
                            previousTask.lessonId ||
                            ""
                        ),

                    taskId:
                        previousTask.taskId,

                    status:
                        "approved",
                });

            if (!previous) {
                throw new AppError(
                    "This task is locked until the previous task is approved.",
                    403
                );
            }
        }

        return new Submission({
            student:
                req.user._id,

            course:
                course?._id ||
                null,

            internship:
                internship?._id ||
                null,

            courseSlug:
                normalizedCourseSlug,

            moduleId:
                requestedTask.moduleId,

            moduleTitle:
                moduleTitle ||
                requestedTask.moduleTitle ||
                "",

            lessonId:
                String(
                    requestedTask.lessonId ||
                    ""
                ),

            taskId:
                requestedTask.taskId,

            taskTitle:
                taskTitle ||
                requestedTask.taskTitle ||
                "Task",

            problemStatement:
                problemStatement ||
                requestedTask.problemStatement ||
                "",

            code,

            answer:
                answer || "",

            githubLink:
                githubLink || "",

            liveLink:
                liveLink || "",

            status:
                "pending",

            submittedAt:
                new Date(),

            reviewedBy:
                null,

            reviewedAt:
                null,

            reviewComment:
                "",
        });
    };
