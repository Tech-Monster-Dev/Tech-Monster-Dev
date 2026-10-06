import "./ApprovalCard.css";

import DEFAULT_PROFILE_IMAGE from "../../../../../assets/profile/default-profile.svg";

const getStudentName = (submission) => {
    const firstName = submission?.student?.firstName || "";
    const lastName = submission?.student?.lastName || "";
    const fullName = `${firstName} ${lastName}`.trim();

    return fullName || submission?.student?.username || "Unknown Student";
};

export default function ApprovalCard({
    submission,
    index = 0,
    onClick,
}) {
    const studentName = getStudentName(submission);
    const status = submission?.status || "pending";

    const avatar =
        submission?.student?.avatar || DEFAULT_PROFILE_IMAGE;

    return (
        <button
            type="button"
            className="approval-card"
            onClick={() => onClick?.(submission)}
            aria-label={`Review ${studentName}'s task`}
        >
            <span className="approval-card-index" aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
            </span>

            <span className="approval-card-content">
                <img
                    className="approval-card-avatar"
                    src={avatar}
                    alt=""
                    loading="lazy"
                    onError={(event) => {
                        event.currentTarget.src = DEFAULT_PROFILE_IMAGE;
                    }}
                />

                <span className="approval-card-name">
                    {studentName}
                </span>

                <span
                    className={`approval-card-status approval-card-status--${status}`}
                >
                    {status}
                </span>
            </span>
        </button>
    );
}
