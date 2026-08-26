import Submission from "../models/Submission.js";

import {
    normalizeSlug,
} from "../utils/submission.utils.js";

import {
    createUnlockedSubmission,
} from "./taskUnlockCreate.service.js";

import {
    reactivateLockedSubmission,
} from "./taskUnlockTimer.service.js";

export const unlockTaskForStudent =
    async (
        studentId,
        courseSlug,
        taskInfo
    ) => {
        if (
            !studentId ||
            !courseSlug ||
            !taskInfo
        ) {
            return null;
        }

        const normalizedCourseSlug =
            normalizeSlug(
                courseSlug
            );

        const normalizedModuleId =
            String(
                taskInfo.moduleId ||
                ""
            ).trim();

        const normalizedLessonId =
            String(
                taskInfo.lessonId ||
                ""
            ).trim();

        const normalizedTaskId =
            String(
                taskInfo.taskId ||
                ""
            ).trim();

        if (
            !normalizedModuleId ||
            !normalizedTaskId
        ) {
            return null;
        }

        let submission =
            await Submission.findOne({
                student: studentId,
                courseSlug:
                    normalizedCourseSlug,
                moduleId:
                    normalizedModuleId,
                lessonId:
                    normalizedLessonId,
                taskId:
                    normalizedTaskId,
            });

        if (!submission) {
            return createUnlockedSubmission(
                studentId,
                normalizedCourseSlug,
                taskInfo
            );
        }

        if (
            submission.status ===
            "locked"
        ) {
            submission =
                await reactivateLockedSubmission(
                    submission
                );
        }

        return submission;
    };
