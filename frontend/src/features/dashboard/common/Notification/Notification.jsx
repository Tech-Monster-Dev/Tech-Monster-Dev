import { motion } from "framer-motion";

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

  console.log(
    "📄 NOTIFICATION PAGE:",
    notifications
  );

  console.log(
    "🔢 UNREAD COUNT:",
    unreadCount
  );


  return (

    <div className="notification-page-wrapper">

      <div className="notification-page-header">

        <h2 className="notification-main-title">
          Notifications
        </h2>


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

          <div className="notification-empty">
            No notifications yet.
          </div>

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