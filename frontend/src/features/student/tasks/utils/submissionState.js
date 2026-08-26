import { getTaskKey } from "./taskUtils";

export const getSubmissionsFromResponse = (response) => {
    return (
        response?.submissions ||
        response?.data?.submissions ||
        []
    );
};

export const getPreferredSubmissions = (
    submissions
) => {
    const preferred = {};

    submissions.forEach((submission) => {
        const key = getTaskKey(submission);

        if (!key) {
            return;
        }

        const current = preferred[key];

        if (!current) {
            preferred[key] = submission;
            return;
        }

        if (
            submission.status === "approved" &&
            current.status !== "approved"
        ) {
            preferred[key] = submission;
        }
    });

    return Object.values(preferred);
};

export const buildSubmissionMaps = (
    submissions
) => {
    const statusMap = {};
    const submittedAtMap = {};
    const deadlineMap = {};
    const submissionIdMap = {};
    const reviewCommentMap = {};

    submissions.forEach((submission) => {
        const key = getTaskKey(submission);

        if (!key) {
            return;
        }

        statusMap[key] = submission.status;

        submittedAtMap[key] =
            submission.submittedAt || null;

        deadlineMap[key] = {
            unlockedAt:
                submission.unlockedAt || null,
            expiresAt:
                submission.expiresAt || null,
            expiredAt:
                submission.expiredAt || null,
        };

        submissionIdMap[key] =
            submission._id || null;

        reviewCommentMap[key] =
            submission.reviewComment || "";
    });

    return {
        statusMap,
        submittedAtMap,
        deadlineMap,
        submissionIdMap,
        reviewCommentMap,
    };
};
