import "./RecentActivities.css";
import EmptyState from "../../../../../components/ui/EmptyState";
import defaultProfileImage from "../../../../../assets/profile/default-profile.svg";

export default function RecentActivities({ activities = [] }) {
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
                                src={activity.user?.avatar && activity.user.avatar !== "/profile/default-profile.svg" ? activity.user.avatar : defaultProfileImage}
                                onError={(event) => {
                                    event.currentTarget.src = defaultProfileImage;
                                }}
                                alt={activity.user?.fullName || "User"}
                            />

                            <div id="activityInfo">
                                <h4>{activity.user?.fullName || "Unknown User"}</h4>
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