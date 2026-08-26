import Submission from "../models/Submission.js";

import AppError from "../../../core/errors/AppError.js";

import {
    normalizeSlug,
} from "../utils/submission.utils.js";

import {
    resolveEnrollment,
} from "./submissionEnrollment.service.js";

import {
    markExpiredIfNeeded,
} from "./taskExpiry.service.js";

import {
    buildNewSubmission,
} from "./submissionCreateTask.service.js";

import {
    validateSubmissionStatus,
    updateSubmission,
} from "./submissionCreateValidation.service.js";

import {
    emitSubmission,
    notifyAdmins,
} from "./submissionCreateNotification.service.js";

export const createSubmission =
    async ({ req }) => {
        const {
            courseSlug,
            moduleId,
            moduleTitle,
            lessonId,
            taskId,
            taskTitle,
            problemStatement,
            code,
            answer,
            githubLink,
            liveLink,
        } = req.body;

        const normalizedCourseSlug =
            normalizeSlug(
                courseSlug
            );

        if (
            !normalizedCourseSlug ||
            !moduleId ||
            !taskId
        ) {
            throw new AppError(
                "courseSlug, moduleId and taskId are required",
                400
            );
        }

        if (
            !code ||
            !code.trim()
        ) {
            throw new AppError(
                "code is required",
                400
            );
        }

        const {
            internship,
            course,
        } =
            await resolveEnrollment(
                req.user._id,
                normalizedCourseSlug
            );

        const normalizedLessonId =
            String(
                lessonId || ""
            ).trim();

        let submission =
            await Submission.findOne({
                student:
                    req.user._id,

                courseSlug:
                    normalizedCourseSlug,

                moduleId,

                lessonId:
                    normalizedLessonId,

                taskId,
            });

        let isNewSubmission =
            false;

        if (!submission) {
            isNewSubmission =
                true;

            submission =
                await buildNewSubmission({
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
                });
        }

        await markExpiredIfNeeded(
            submission
        );

        validateSubmissionStatus(
            submission,
            isNewSubmission
        );

        updateSubmission(
            submission,
            {
                moduleTitle,
                taskTitle,
                problemStatement,
                code,
                answer,
                githubLink,
                liveLink,
            }
        );

        await submission.save();

        emitSubmission(
            req,
            submission
        );

        await notifyAdmins(
            req,
            submission
        );

        return submission;
    };
