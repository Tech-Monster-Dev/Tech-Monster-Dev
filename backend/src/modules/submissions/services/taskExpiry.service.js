import {
    emitToUser,
} from "../../../infrastructure/socket/socket.js";

import {
    getSubmissionTaskKey,
    isExpired,
} from "../utils/submission.utils.js";

export const markExpiredIfNeeded =
    async (
        submission,
        now = new Date()
    ) => {
        if (
            !isExpired(
                submission,
                now
            )
        ) {
            return submission;
        }

        submission.status =
            "expired";

        submission.expiredAt =
            submission.expiredAt ||
            now;

        await submission.save();

        emitToUser(
            submission.student,
            "taskExpired",
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