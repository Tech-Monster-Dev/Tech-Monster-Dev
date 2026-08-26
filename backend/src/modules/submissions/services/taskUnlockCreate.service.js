import Submission from "../models/Submission.js";
import {
    resolveEnrollment,
} from "./submissionEnrollment.service.js";

import {
    emitToUser,
} from "../../../infrastructure/socket/socket.js";

import {
    getSubmissionTaskKey,
} from "../utils/submission.utils.js";

const DEADLINE_MS =
    48 * 60 * 60 * 1000;

export const createUnlockedSubmission =
    async (
        studentId,
        courseSlug,
        taskInfo
    ) => {
        const {
            internship,
            course,
        } = await resolveEnrollment(
            studentId,
            courseSlug
        );

        const unlockedAt =
            new Date();

        const expiresAt =
            new Date(
                unlockedAt.getTime() +
                DEADLINE_MS
            );

        const submission =
            await Submission.create({
                student:
                    studentId,

                internship:
                    internship?._id ||
                    null,

                course:
                    course?._id ||
                    null,

                courseSlug,

                moduleId:
                    String(
                        taskInfo.moduleId ||
                        ""
                    ).trim(),

                moduleTitle:
                    taskInfo.moduleTitle ||
                    "",

                lessonId:
                    String(
                        taskInfo.lessonId ||
                        ""
                    ).trim(),

                taskId:
                    String(
                        taskInfo.taskId ||
                        ""
                    ).trim(),

                taskTitle:
                    taskInfo.taskTitle ||
                    "Task",

                problemStatement:
                    taskInfo.problemStatement ||
                    "",

                status:
                    "unlocked",

                unlockedAt,

                expiresAt,

                expiredAt:
                    null,
            });

        emitToUser(
            studentId,
            "taskUnlocked",
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
