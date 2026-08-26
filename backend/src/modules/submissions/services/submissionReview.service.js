import Submission from "../models/Submission.js";
import Notification from "../../notifications/models/Notification.js";

import AppError from "../../../core/errors/AppError.js";

import {
    emitToUser,
} from "../../../infrastructure/socket/socket.js";

import {
    getSubmissionTaskKey,
} from "../utils/submission.utils.js";

export const rejectSubmission =
    async (
        submissionId,
        reviewerId,
        comment
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

        submission.status =
            "rejected";

        submission.reviewedBy =
            reviewerId;

        submission.reviewedAt =
            new Date();

        submission.reviewComment =
            comment || "";

        await submission.save();

        await Notification.create({
            user:
                submission.student,

            title:
                "Task Review",

            message:
                comment ||
                `Your task "${submission.taskTitle || submission.taskId}" requires correction. Please update and submit again.`,

            type:
                "system",
        });

        emitToUser(
            submission.student,
            "taskRejected",
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