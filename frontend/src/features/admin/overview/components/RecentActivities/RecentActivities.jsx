import "./RecentActivities.css";
import EmptyState from "../../../../../components/ui/EmptyState";

export default function RecentActivities({ activities = [] }) {
    console.log("Activities", activities);
    return (
        <div id="recentActivities">
            <h2>Recent Activities</h2>
            {
                activities.length === 0 ? (
                    <EmptyState
                        compact
                        heading="No Recent Activities"
                        paragraph="There are no recent activities to display right now."
                    />
                ) : (
                    activities.map((activity) => (
                        <div
                            key={activity._id}
                            id="activityCard"
                        >

                            <img
                                src={activity.avatar}
                                alt={activity.fullName}
                            />

                            <div id="activityInfo">
                                <h4>{activity.fullName}</h4>
                                <p>{activity.description}</p>
                                <small>{activity.module}</small>
                            </div>
                            <span>
                                {new Date(activity.createdAt).toLocaleDateString()}
                            </span>
                        </div>
                    ))
                )
            }
        </div>
    );
}