import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./ApprovalPreviewModal.css";

const DEFAULT_PROFILE_IMAGE = "/profile/default-profile.svg";

const getStudentName = (submission) => {
    const firstName = submission?.student?.firstName || "";
    const lastName = submission?.student?.lastName || "";
    const fullName = `${firstName} ${lastName}`.trim();

    return fullName || submission?.student?.username || "Unknown Student";
};

const getProgram = (submission) => {
    if (submission?.internship) {
        return {
            type: "Internship",
            title:
                submission.internship.title ||
                submission.internship.slug ||
                "—",
        };
    }

    return {
        type: "Course",
        title:
            submission?.course?.title ||
            submission?.courseSlug ||
            "—",
    };
};

const formatDateTime = (value) => {
    if (!value) return "Not available";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "Not available";
    }

    return new Intl.DateTimeFormat("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(date);
};

const getValidity = (submission) => {
    if (submission?.status === "expired") {
        return {
            label: "Expired",
            value: formatDateTime(
                submission.expiredAt || submission.expiresAt
            ),
            className: "expired",
        };
    }

    if (!submission?.expiresAt) {
        return {
            label: "Validity",
            value: "No deadline",
            className: "",
        };
    }

    const expiresAt = new Date(submission.expiresAt);
    const remainingMs = expiresAt.getTime() - Date.now();

    if (Number.isNaN(expiresAt.getTime())) {
        return {
            label: "Validity",
            value: "Not available",
            className: "",
        };
    }

    if (remainingMs <= 0) {
        return {
            label: "Expired",
            value: formatDateTime(submission.expiresAt),
            className: "expired",
        };
    }

    const totalMinutes = Math.floor(remainingMs / 60000);
    const days = Math.floor(totalMinutes / 1440);
    const hours = Math.floor((totalMinutes % 1440) / 60);

    let remainingLabel = "Expires soon";

    if (days > 0) {
        remainingLabel = `${days}d ${hours}h remaining`;
    } else if (hours > 0) {
        remainingLabel = `${hours}h remaining`;
    }

    return {
        label: "Valid until",
        value: `${formatDateTime(submission.expiresAt)} · ${remainingLabel}`,
        className: "",
    };
};

export default function ApprovalPreviewModal({
    submission,
    onClose,
}) {
    const navigate = useNavigate();

    useEffect(() => {
        if (!submission) return undefined;

        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                onClose?.();
            }
        };

        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [submission, onClose]);

    useEffect(() => {
        if (!submission) return undefined;

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, [submission]);

    if (!submission) {
        return null;
    }

    const studentName = getStudentName(submission);
    const program = getProgram(submission);
    const validity = getValidity(submission);

    const avatar =
        submission?.student?.avatar || DEFAULT_PROFILE_IMAGE;

    const handleViewDetails = () => {
        if (!submission?._id) return;

        onClose?.();
        navigate(`/admin/tasks/${submission._id}`);
    };

    const handleBackdropClick = (event) => {
        if (event.target === event.currentTarget) {
            onClose?.();
        }
    };

    return (
        <div
            className="approval-preview-modal"
            role="presentation"
            onMouseDown={handleBackdropClick}
        >
            <div
                className="approval-preview-dialog"
                role="dialog"
                aria-modal="true"
                aria-labelledby="approval-preview-title"
            >
                <div className="approval-preview-header">
                    <div>
                        <span>Submission Preview</span>
                        <h2 id="approval-preview-title">
                            Review task submission
                        </h2>
                    </div>

                    <button
                        type="button"
                        className="approval-preview-close"
                        onClick={onClose}
                        aria-label="Close submission preview"
                    >
                        ×
                    </button>
                </div>

                <div className="approval-preview-student">
                    <img
                        src={avatar}
                        alt=""
                        className="approval-preview-avatar"
                        onError={(event) => {
                            event.currentTarget.src =
                                DEFAULT_PROFILE_IMAGE;
                        }}
                    />

                    <div className="approval-preview-student-info">
                        <strong>{studentName}</strong>
                        <span>
                            @{submission?.student?.username || "student"}
                        </span>
                        {submission?.student?.email && (
                            <small>{submission.student.email}</small>
                        )}
                    </div>

                    <span
                        className={`approval-preview-status approval-preview-status--${submission.status || "pending"}`}
                    >
                        {submission.status || "pending"}
                    </span>
                </div>

                <div className="approval-preview-details">
                    <div className="approval-preview-detail">
                        <span>Program</span>
                        <strong>{program.title}</strong>
                        <small>{program.type}</small>
                    </div>

                    <div className="approval-preview-detail">
                        <span>Module</span>
                        <strong>
                            {submission?.moduleTitle ||
                                submission?.moduleId ||
                                "—"}
                        </strong>
                    </div>

                    <div className="approval-preview-detail approval-preview-detail--wide">
                        <span>Task</span>
                        <strong>
                            {submission?.taskTitle ||
                                submission?.taskId ||
                                "Untitled task"}
                        </strong>
                    </div>

                    <div className="approval-preview-detail">
                        <span>Submitted for approval</span>
                        <strong>
                            {formatDateTime(submission?.submittedAt)}
                        </strong>
                    </div>

                    <div
                        className={`approval-preview-detail ${validity.className}`}
                    >
                        <span>{validity.label}</span>
                        <strong>{validity.value}</strong>
                    </div>
                </div>

                <div className="approval-preview-footer">
                    <button
                        type="button"
                        className="approval-preview-cancel"
                        onClick={onClose}
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        className="approval-preview-details-button"
                        onClick={handleViewDetails}
                    >
                        View Details
                        <span aria-hidden="true">→</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
