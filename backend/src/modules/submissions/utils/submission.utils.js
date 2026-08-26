export const normalizeSlug = (slug) =>
    String(slug || "")
        .trim()
        .toLowerCase()
        .replace(/_/g, "-");

export const getSubmissionTaskKey = (submission) => {
    if (
        !submission?.moduleId ||
        !submission?.taskId
    ) {
        return "";
    }

    return [
        String(submission.moduleId),
        String(submission.lessonId || ""),
        String(submission.taskId),
    ].join("_");
};

export const isExpired = (
    submission,
    now = new Date()
) =>
    submission?.expiresAt &&
    submission.status !== "approved" &&
    new Date(
        submission.expiresAt
    ).getTime() <= now.getTime();