import AppError from "../../../core/errors/AppError.js";

export const validateSubmissionStatus = (
    submission,
    isNewSubmission
) => {
    if (
        submission.status ===
        "expired"
    ) {
        throw new AppError(
            "This task deadline has expired. Please contact support for an extension.",
            403
        );
    }

    if (
        submission.status ===
        "locked"
    ) {
        throw new AppError(
            "This task is locked until the previous task is approved.",
            403
        );
    }

    if (
        !isNewSubmission &&
        submission.status ===
            "pending"
    ) {
        throw new AppError(
            "This task is already submitted and is waiting for admin approval.",
            400
        );
    }

    if (
        submission.status ===
        "approved"
    ) {
        throw new AppError(
            "This task is already approved.",
            400
        );
    }
};

export const updateSubmission = (
    submission,
    data
) => {
    submission.moduleTitle =
        data.moduleTitle ||
        submission.moduleTitle ||
        "";

    submission.taskTitle =
        data.taskTitle ||
        submission.taskTitle ||
        "";

    submission.problemStatement =
        data.problemStatement ||
        submission.problemStatement ||
        "";

    submission.code =
        data.code;

    submission.answer =
        data.answer ||
        submission.answer ||
        "";

    submission.githubLink =
        data.githubLink ||
        submission.githubLink ||
        "";

    submission.liveLink =
        data.liveLink ||
        submission.liveLink ||
        "";

    submission.status =
        "pending";

    submission.submittedAt =
        new Date();

    submission.reviewedBy =
        null;

    submission.reviewedAt =
        null;

    submission.reviewComment =
        "";
};
