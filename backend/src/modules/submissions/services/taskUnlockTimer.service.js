const DEADLINE_MS =
    48 * 60 * 60 * 1000;

export const reactivateLockedSubmission =
    async (
        submission
    ) => {
        const unlockedAt =
            new Date();

        submission.status =
            "unlocked";

        submission.unlockedAt =
            unlockedAt;

        submission.expiresAt =
            new Date(
                unlockedAt.getTime() +
                DEADLINE_MS
            );

        submission.expiredAt =
            null;

        await submission.save();

        return submission;
    };
