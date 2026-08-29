import { motion } from "framer-motion";
import EmptyState from "../../../../components/ui/EmptyState";

import useNotification from "../../../../shared/hooks/useNotification";

import "./Notification.css";


export default function Notification() {

  const {

    notifications,

    loading,

    unreadCount,

    markAsRead,

    markAllAsRead,

    removeNotification

  } = useNotification();


  if (loading) {

    return (
      <div className="notification-page-wrapper">
        Loading notifications...
      </div>
    );

  }


  return (

    <div className="notification-page-wrapper">
      <div className="notification-page-header">
        {unreadCount > 0 && (
          <button
            className="mark-all-btn"
            onClick={markAllAsRead}
          >
            Mark all as read
          </button>
        )}
      </div>


      <div className="notifications-container">
        {notifications.length === 0 ? (
          <EmptyState
            fullPage
            heading="No Notifications Yet"
            paragraph="You are all caught up. New notifications will appear here when available."
          />

        ) : (

          notifications.map(
            (item, index) => (

              <motion.div
                key={item._id}
                className={
                  `notification-card ${!item.isRead
                    ? "unread"
                    : ""
                  }`
                }
                initial={{
                  opacity: 0,
                  y: 20
                }}
                animate={{
                  opacity: 1,
                  y: 0
                }}
                transition={{
                  duration: 0.3,
                  delay:
                    index * 0.05
                }}
                whileHover={{
                  scale: 1.01
                }}
                onClick={() =>
                  !item.isRead &&
                  markAsRead(
                    item._id
                  )
                }
              >

                <div className="notif-content">
                  <h4>
                    {item.title}
                  </h4>
                  <p>
                    {item.message}
                  </p>
                  <span className="notif-time">
                    {new Date(
                      item.createdAt
                    ).toLocaleString()}
                  </span>
                </div>

                <div
                  className={
                    `read-status-dot ${item.isRead
                      ? "read"
                      : ""
                    }`
                  }
                />


                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeNotification(
                      item._id
                    );
                  }}
                >
                  Delete
                </button>
              </motion.div>
            )
          )
        )}
      </div>
    </div>
  );
}