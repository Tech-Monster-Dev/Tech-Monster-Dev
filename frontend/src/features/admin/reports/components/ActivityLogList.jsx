import EmptyState from "../../../../components/ui/EmptyState";

const formatActivityDate = (date) => {
    if (!date) return "Unknown date";

    return new Intl.DateTimeFormat("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(new Date(date));
};

const ActivityLogList = ({ activities = [] }) => {
    if (!activities.length) {
        return (
            <EmptyState
                heading="No activity recorded"
                paragraph="No activity was recorded for this month."
                compact
            />
        );
    }

    return (
        <div className="activity-log-list">
            {activities.map((activity) => (
                <article
                    className="activity-log-item"
                    key={activity._id}
                >
                    <div className="activity-log-header">
                        <div className="activity-log-heading">
                            <span className="activity-log-action">
                                {activity.action || "Activity"}
                            </span>

                            {activity.module && (
                                <span className="activity-log-module">
                                    {activity.module}
                                </span>
                            )}
                        </div>

                        <time
                            className="activity-log-time"
                            dateTime={activity.createdAt}
                        >
                            {formatActivityDate(activity.createdAt)}
                        </time>
                    </div>

                    <p className="activity-log-description">
                        {activity.description || "No description available."}
                    </p>

                    {(activity.targetModel ||
                        activity.ipAddress ||
                        activity.userAgent) && (
                        <div className="activity-log-meta">
                            {activity.targetModel && (
                                <span>
                                    Target: {activity.targetModel}
                                </span>
                            )}

                            {activity.ipAddress && (
                                <span>
                                    IP: {activity.ipAddress}
                                </span>
                            )}

                            {activity.userAgent && (
                                <span>
                                    Device: {activity.userAgent}
                                </span>
                            )}
                        </div>
                    )}
                </article>
            ))}
        </div>
    );
};

export default ActivityLogList;