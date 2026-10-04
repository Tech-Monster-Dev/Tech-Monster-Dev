import EmptyState from "../../../../../components/ui/EmptyState";
import StatusBadge from "./StatusBadge";

const NotificationHistory = ({
    notifications,
    formatValue,
    formatDateTime
}) => (
    <section className="tableCard">
        <div className="tableCardHeader">
            <div>
                <h2>Notification History</h2>

                <p>
                    Admin notifications sent to this student
                </p>
            </div>
        </div>

        {notifications.length ? (
            <div className="responsiveTableWrapper">
                <table>
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Message</th>
                            <th>Sender</th>
                            <th>Date</th>
                            <th>Read</th>
                        </tr>
                    </thead>

                    <tbody>
                        {notifications.map((item) => {
                            const senderName = [
                                item.sender?.firstName,
                                item.sender?.middleName,
                                item.sender?.lastName
                            ]
                                .filter(Boolean)
                                .join(" ");

                            return (
                                <tr key={item._id}>
                                    <td data-label="Title">
                                        {formatValue(item.title)}
                                    </td>

                                    <td
                                        data-label="Message"
                                        className="notificationMessage"
                                    >
                                        {formatValue(item.message)}
                                    </td>

                                    <td data-label="Sender">
                                        {formatValue(
                                            senderName ||
                                            item.sender?.username
                                        )}
                                    </td>

                                    <td data-label="Date">
                                        {formatDateTime(
                                            item.createdAt
                                        )}
                                    </td>

                                    <td data-label="Read">
                                        <StatusBadge
                                            value={
                                                item.isRead
                                                    ? "Read"
                                                    : "Unread"
                                            }
                                            type={
                                                item.isRead
                                                    ? "success"
                                                    : "default"
                                            }
                                        />
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        ) : (
            <EmptyState
                heading="No Admin Notifications"
                paragraph="No notifications have been sent to this student by an admin."
            />
        )}
    </section>
);

export default NotificationHistory;
