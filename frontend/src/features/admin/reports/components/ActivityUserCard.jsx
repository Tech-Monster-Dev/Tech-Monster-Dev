const getFullName = (user) =>
    [user?.firstName, user?.middleName, user?.lastName]
        .filter(Boolean)
        .join(" ")
        .trim() || user?.username || "Unknown user";

const ActivityUserCard = ({
    user,
    onClick,
}) => {
    const fullName = getFullName(user);

    return (
        <button
            type="button"
            className="activity-user-card"
            onClick={() => onClick?.(user)}
        >
            <img
                className="activity-user-avatar"
                src={user?.avatar || "/profile/default-profile.svg"}
                alt=""
                loading="lazy"
            />

            <span className="activity-user-info">
                <span className="activity-user-name">
                    {fullName}
                </span>

                <span className="activity-user-email">
                    {user?.email || user?.username || "Student"}
                </span>
            </span>

            <span
                className="activity-user-action"
                aria-hidden="true"
            >
                View activity
            </span>
        </button>
    );
};

export default ActivityUserCard;