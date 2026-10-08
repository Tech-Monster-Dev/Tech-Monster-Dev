const getFullName = (user) =>
    [user?.firstName, user?.middleName, user?.lastName]
        .filter(Boolean)
        .join(" ")
        .trim() || user?.username || "Unknown user";

const ReportUserCard = ({
    user,
    meta,
    onClick,
}) => {
    const fullName = getFullName(user);

    return (
        <button
            type="button"
            className="report-user-card"
            onClick={() => onClick?.(user)}
        >
            <img
                className="report-user-avatar"
                src={user?.avatar || "/profile/default-profile.svg"}
                alt=""
                loading="lazy"
            />

            <span className="report-user-info">
                <span className="report-user-name">
                    {fullName}
                </span>

                {meta && (
                    <span className="report-user-meta">
                        {meta}
                    </span>
                )}
            </span>
        </button>
    );
};

export default ReportUserCard;