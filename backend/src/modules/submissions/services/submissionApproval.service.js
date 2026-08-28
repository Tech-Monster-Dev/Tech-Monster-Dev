import Submission from "../models/Submission.js";
import Notification from "../../notifications/models/Notification.js";

import AppError from "../../../core/errors/AppError.js";

import {
    emitToUser,
} from "../../../infrastructure/socket/socket.js";

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

import {
    qualifyLearningDay,
} from "../../learning/learningDay.service.js";

export const approveSubmission =
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

        await markExpiredIfNeeded(
            submission
        );

        if (
            submission.status ===
            "expired"
        ) {
            throw new AppError(
                "This task deadline has expired. Extend it before approval.",
                400
            );
        }

        submission.status =
            "approved";

        submission.reviewedBy =
            reviewerId;

        submission.reviewedAt =
            new Date();

        submission.reviewComment =
            comment || "";

        await submission.save();

        const courseSlug =
            normalizeSlug(
                submission.courseSlug
            );

        const courseData =
            await readCourseData(
                courseSlug
            );

        const orderedTasks =
            getOrderedCourseTasks(
                courseData
            );

        const currentIndex =
            orderedTasks.findIndex(
                (task) =>
                    String(
                        task.moduleId ||
                        ""
                    ) ===
                    String(
                        submission.moduleId ||
                        ""
                    ) &&
                    String(
                        task.lessonId ||
                        ""
                    ) ===
                    String(
                        submission.lessonId ||
                        ""
                    ) &&
                    String(
                        task.taskId ||
                        ""
                    ) ===
                    String(
                        submission.taskId ||
                        ""
                    )
            );

        const candidate =
            currentIndex >= 0
                ? orderedTasks[
                    currentIndex + 1
                ]
                : null;

        const nextTask =
            candidate &&
            String(
                candidate.moduleId ||
                ""
            ) ===
            String(
                submission.moduleId ||
                ""
            )
                ? candidate
                : null;

        const moduleCompleted =
            currentIndex >= 0 &&
            (
                candidate == null ||
                String(
                    candidate.moduleId ||
                    ""
                ) !==
                String(
                    submission.moduleId ||
                    ""
                )
            );

        const approvedCount =
            await Submission.countDocuments({
                student:
                    submission.student,

                courseSlug,

                status:
                    "approved",
            });

        const allTasksCompleted =
            orderedTasks.length > 0 &&
            approvedCount >=
            orderedTasks.length;

        await qualifyLearningDay({
            studentId:
                submission.student,

            courseSlug,

            courseId:
                submission.course || null,

            internshipId:
                submission.internship || null,

            lessonId:
                submission.lessonId,

            taskId:
                submission.taskId,

            approvedAt:
                submission.reviewedAt || new Date()
        });

        console.log("=== TASK APPROVAL UNLOCK DEBUG ===");
        console.log("currentIndex:", currentIndex);
        console.log("approvedTask:", {
            moduleId: submission.moduleId,
            lessonId: submission.lessonId,
            taskId: submission.taskId,
        });
        console.log("candidate:", candidate);
        console.log("nextTask:", nextTask);

        const unlockedSubmission =
            nextTask
                ? await unlockTaskForStudent(
                    submission.student,
                    courseSlug,
                    nextTask
                )
                : null;

        console.log("unlockedSubmission:", unlockedSubmission);
        console.log("=== END TASK APPROVAL UNLOCK DEBUG ===");

        await Notification.create({
            user:
                submission.student,

            title:
                "Task Approved",

            message:
                `Your task "${submission.taskTitle || submission.taskId}" has been approved.`,

            type:
                "system",
        });

        emitToUser(
            submission.student,
            "taskApproved",
            {
                submission,
                unlockedSubmission,

                approvedTaskKey:
                    getSubmissionTaskKey(
                        submission
                    ),

                unlockedTaskKey:
                    unlockedSubmission
                        ? [
                            String(
                                unlockedSubmission.moduleId
                            ),
                            String(
                                unlockedSubmission.lessonId ||
                                ""
                            ),
                            String(
                                unlockedSubmission.taskId
                            ),
                        ].join("_")
                        : null,

                moduleCompleted,
                allTasksCompleted,
            }
        );

        return {
            submission,
            unlockedSubmission,
        };
    };