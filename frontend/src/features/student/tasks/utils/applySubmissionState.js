export const getSubmissionState = (submission) => {
    if (
        !submission?.moduleId ||
        !submission?.taskId
    ) {
        return null;
    }

    return {
        status: submission.status,
        submittedAt: submission.submittedAt || null,
        deadline: {
            unlockedAt: submission.unlockedAt || null,
            expiresAt: submission.expiresAt || null,
            expiredAt: submission.expiredAt || null,
        },
        reviewComment:
            submission.reviewComment || "",
        submissionId:
            submission._id || null,
    };
};
