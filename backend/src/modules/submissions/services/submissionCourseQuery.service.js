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
