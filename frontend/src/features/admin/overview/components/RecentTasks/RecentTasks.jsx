import "./RecentTasks.css";
import defaultProfileImage from "../../../../../assets/profile/default-profile.svg";

export default function RecentTasks({

    tasks = []

}) {

    const getBadge = (status) => {

        switch (status) {

            case "Submitted":
                return {
                    text: "Pending Review",
                    id: "today"
                };

            case "Approved":
                return {
                    text: "Approved",
                    id: "upcoming"
                };

            case "Incorrect":
                return {
                    text: "Rejected",
                    id: "late"
                };

            default:
                return {
                    text: status,
                    id: "today"
                };

        }

    };

    return (

        <div id="overViewRecentTasks">
            <h2>
                Recent Tasks
            </h2>
            {
                tasks.map(task => {
                    const badge = getBadge(task.status);

                    return (

                        <div
                            key={task._id}
                            id="overViewRecentTasksCard"
                        >
                            <img
                                src={task.avatar && task.avatar !== "/profile/default-profile.svg" ? task.avatar : defaultProfileImage}
                                onError={(event) => {
                                    event.currentTarget.src = defaultProfileImage;
                                }}
                                alt={task.student}
                            />

                            <div id="overViewRecentTasksInfo">
                                <h3>
                                    {task.title}
                                </h3>

                                <p>
                                    {task.student}
                                </p>

                                <small id={badge.className}>
                                    {badge.text}
                                </small>

                                <small>
                                    {new Date(task.submittedAt).toLocaleDateString()}
                                </small>
                            </div>

                            <div id="overViewRecentTasksRight">
                                <span>
                                    {task.status}
                                </span>

                                <small
                                    id={badge.className}
                                >
                                    {badge.text}
                                </small>
                            </div>
                        </div>
                    );
                })
            }
        </div>
    );
}