import User from "../../user/models/User.js";
import Notification from "../../notifications/models/Notification.js";

import {
    emitToUser,
    getIO,
} from "../../../infrastructure/socket/socket.js";

export const emitSubmission = (
    req,
    submission
) => {
    getIO()?.emit(
        "taskSubmitted",
        {
            submissionId:
                submission._id,

            student:
                req.user._id,

            courseSlug:
                submission.courseSlug,

            moduleId:
                submission.moduleId,

            taskId:
                submission.taskId,

            title:
                submission.taskTitle,

            status:
                submission.status,
        }
    );
};

export const notifyAdmins =
    async (
        req,
        submission
    ) => {
        const admins =
            await User.find({
                role: "admin",
            });

        await Promise.all(
            admins.map(
                async (admin) => {
                    const notification =
                        await Notification.create(
                            {
                                user:
                                    admin._id,

                                title:
                                    "Task Approval",

                                message:
                                    `${req.user.firstName} ${req.user.lastName} submitted "${submission.taskTitle || submission.taskId}" for approval.`,

                                type:
                                    "system",
                            }
                        );

                    emitToUser(
                        admin._id,
                        "newNotification",
                        notification
                    );
                }
            )
        );
    };
