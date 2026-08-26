import Submission from "../models/Submission.js";

import AppError from "../../../core/errors/AppError.js";

import {
    normalizeSlug,
    getSubmissionTaskKey,
} from "../utils/submission.utils.js";

import {
    readCourseData,
    getOrderedCourseTasks,
} from "../utils/courseTask.utils.js";

import {
    markExpiredIfNeeded,
} from "./taskExpiry.service.js";

import {
    unlockTaskForStudent,
} from "./taskUnlock.service.js";

export const getMyCourseSubmissions =
    async (studentId, rawSlug) => {
        const courseSlug =
            normalizeSlug(
                rawSlug
            );

        if (!courseSlug) {
            throw new AppError(
                "Course slug is required.",
                400
            );
        }

        const courseData =
            await readCourseData(
                courseSlug
            );

        if (!courseData) {
            throw new AppError(
                "Course data not found.",
                404
            );
        }

        const orderedTasks =
            getOrderedCourseTasks(
                courseData
            );

        if (!orderedTasks.length) {
            return {
                orderedTasks: [],
                submissions: [],
            };
        }

        let submissions =
            await Submission.find({
                student: studentId,
                courseSlug,
            }).sort({
                updatedAt: -1,
            });

        const submissionMap =
            buildSubmissionMap(
                submissions
            );

        for (
            let index = 0;
            index <
            orderedTasks.length;
            index++
        ) {
            const task =
                orderedTasks[index];

            const key = [
                String(
                    task.moduleId
                ),
                String(
                    task.lessonId || ""
                ),
                String(
                    task.taskId
                ),
            ].join("_");

            const existing =
                submissionMap.get(
                    key
                );

            if (existing) {
                const updated =
                    await markExpiredIfNeeded(
                        existing
                    );

                submissionMap.set(
                    key,
                    updated
                );

                submissions =
                    replaceSubmission(
                        submissions,
                        updated
                    );

                if (
                    updated.status !==
                    "approved"
                ) {
                    break;
                }

                continue;
            }

            const previousTask =
                orderedTasks[
                    index - 1
                ];

            const previousKey =
                previousTask
                    ? [
                        String(
                            previousTask.moduleId
                        ),
                        String(
                            previousTask.lessonId ||
                            ""
                        ),
                        String(
                            previousTask.taskId
                        ),
                    ].join("_")
                    : null;

            const previousSubmission =
                previousKey
                    ? submissionMap.get(
                        previousKey
                    )
                    : null;

            const sameModule =
                index > 0 &&
                String(
                    task.moduleId ||
                    ""
                ) ===
                String(
                    previousTask?.moduleId ||
                    ""
                );

            const canUnlock =
                index === 0 ||
                (
                    sameModule &&
                    previousSubmission?.status ===
                    "approved"
                );

            if (canUnlock) {
                const unlocked =
                    await unlockTaskForStudent(
                        studentId,
                        courseSlug,
                        task
                    );

                if (unlocked) {
                    submissionMap.set(
                        key,
                        unlocked
                    );

                    submissions.push(
                        unlocked
                    );
                }
            }

            break;
        }

        submissions =
            await Promise.all(
                submissions.map(
                    (submission) =>
                        markExpiredIfNeeded(
                            submission
                        )
                )
            );

        return {
            orderedTasks,
            submissions,
        };
    };

const buildSubmissionMap = (
    submissions
) => {
    const map = new Map();

    submissions.forEach(
        (submission) => {
            const key =
                getSubmissionTaskKey(
                    submission
                );

            if (
                !map.has(key)
            ) {
                map.set(
                    key,
                    submission
                );
            }
        }
    );

    return map;
};

const replaceSubmission = (
    submissions,
    updated
) =>
    submissions.map(
        (item) =>
            String(
                item._id
            ) ===
            String(
                updated._id
            )
                ? updated
                : item
    );