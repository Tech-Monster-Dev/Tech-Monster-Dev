import {
    formatCountdown,
    getTaskExpiresAt,
} from "../../utils/taskUtils";

const TaskDeadlineCard = ({
    deadline,
    now,
    expired,
    status,
}) => {

    const expiresAt = getTaskExpiresAt(deadline);

    const countdown =
        formatCountdown(
            expiresAt,
            now
        );

    const isApproved =
        status === "approved";

    const displayTime =
        isApproved
            ? "Approved"
            : expired
            ? "00:00:00"
            : countdown || "--:--:--";

    return (
        <div
            className={`task-deadline-card ${
                expired
                    ? "expired"
                    : ""
            }`}
        >

            <div className="task-deadline-card-time">

                <span>
                    Timer
                </span>

                <strong>
                    {displayTime}
                </strong>

            </div>

            <p>

                {isApproved
                    ? "This task has been approved."
                    : expired
                    ? "Submission is disabled. Contact support for an extension."
                    : expiresAt
                    ? "48-hour task timer is running."
                    : "This task starts when it unlocks."}

            </p>

        </div>
    );
};

export default TaskDeadlineCard;
