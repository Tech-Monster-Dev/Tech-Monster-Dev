import Submission from "../models/Submission.js";
import Notification from "../../notifications/models/Notification.js";

import AppError from "../../../core/errors/AppError.js";

import {
    emitToUser,
} from "../../../infrastructure/socket/socket.js";

import {
    getSubmissionTaskKey,
} from "../utils/submission.utils.js";

export const extendDeadline =
    async (
        submissionId,
        userId,
        hours
    ) => {
        const submission =
            await Submission.findById(
                submissionId
            );

        if (!submission) {
            throw new AppError(
                "Submission not found",
                404
            );
        }

        if (
            [
                "approved",
                "pending",
            ].includes(
                submission.status
            )
        ) {
            throw new AppError(
                "Only unlocked, rejected, or expired tasks can be extended.",
                400
            );
        }

        const now =
            new Date();

        const extensionHours =
            Number(hours || 24);

        const extensionMs =
            Math.max(
                1,
                extensionHours
            ) *
            60 *
            60 *
            1000;

        submission.status =
            "unlocked";

        submission.unlockedAt =
            submission.unlockedAt ||
            now;

        submission.expiresAt =
            new Date(
                now.getTime() +
                extensionMs
            );

        submission.expiredAt =
            null;

        submission.extendedAt =
            now;

        submission.extendedBy =
            userId;

        await submission.save();

        await Notification.create({
            user:
                submission.student,

            title:
                "Task Deadline Extended",

            message:
                `Your task "${submission.taskTitle || submission.taskId}" deadline has been extended.`,

            type:
                "system",
        });

        emitToUser(
            submission.student,
            "taskDeadlineExtended",
            {
                submission,

                taskKey:
                    getSubmissionTaskKey(
                        submission
                    ),
            }
        );

        return submission;
    };