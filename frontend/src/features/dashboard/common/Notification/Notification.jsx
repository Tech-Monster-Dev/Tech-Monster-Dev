import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  FiArrowRight,
  FiMessageCircle,
  FiTrash2,
  FiUserPlus,
} from "react-icons/fi";
import { motion } from "framer-motion";
import { toast } from "react-toastify";

import EmptyState from "../../../../components/ui/EmptyState";
import useNotification from "../../../../shared/hooks/useNotification";
import { followUser } from "../../../../services/api/follow.service";

import "./Notification.css";

export default function Notification() {
  const location = useLocation();
  const navigate = useNavigate();
  const autoReadTriggered = useRef(false);
  const [followedBackIds, setFollowedBackIds] = useState(new Set());
  const [followLoadingIds, setFollowLoadingIds] = useState(new Set());

  const {
    notifications,
    loading,
    unreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
  } = useNotification();

  const role = location.pathname.startsWith("/admin") ? "admin" : "student";

  useEffect(() => {
    if (
      !loading &&
      unreadCount > 0 &&
      !autoReadTriggered.current
    ) {
      autoReadTriggered.current = true;
      markAllAsRead().catch(() => {
        autoReadTriggered.current = false;
      });
    }
  }, [loading, unreadCount, markAllAsRead]);

  const handleNotificationClick = async (notification) => {
    if (!notification?.isRead) {
      try {
        await markAsRead(notification._id);
      } catch {
        return;
      }
    }

    const context = notification.context || {};
    const type = notification.type;

    if (type === "message" && context.conversationId) {
      navigate(
        role === "admin"
          ? "/admin/support"
          : "/student/help&support",
        {
          state: {
            notificationConversationId: String(
              context.conversationId
            ),
          },
        }
      );
      return;
    }

    if (type === "message" && context.senderId) {
      navigate(`/${role}/message`, {
        state: {
          notificationUserId: String(context.senderId),
          notificationMessageId: context.messageId
            ? String(context.messageId)
            : null,
        },
      });
      return;
    }

    if (type === "follow" && context.followerId) {
      navigate(`/student/user-profile/${context.followerId}`);
      return;
    }

    if (type === "certificate") {
      const programId =
        context.programId ||
        context.internshipId ||
        context.courseId;

      if (programId) {
        navigate("/student/certificate", {
          state: {
            programId: String(programId),
            programType: context.programType || null,
          },
        });
        return;
      }

      navigate("/student/certificate");
      return;
    }

    if (context.taskId) {
      if (role === "admin") {
        navigate(`/admin/tasks/${context.taskId}`);
        return;
      }

      if (context.courseSlug) {
        const type =
          context.internshipId && !context.courseId
            ? "internship"
            : "course";

        navigate(`/student/tasks/${type}/${context.courseSlug}`, {
          state: {
            moduleId: context.moduleId || null,
            lessonId: context.lessonId || null,
            taskId: context.taskId,
          },
        });
        return;
      }

      navigate("/student/tasks");
      return;
    }

    if (context.submissionId) {
      if (role === "admin") {
        if (context.taskId) {
          navigate(`/admin/tasks/${context.taskId}`);
        }
        return;
      }

      if (context.courseSlug) {
        const type =
          context.internshipId && !context.courseId
            ? "internship"
            : "course";

        navigate(`/student/tasks/${type}/${context.courseSlug}`, {
          state: {
            moduleId: context.moduleId || null,
            lessonId: context.lessonId || null,
            taskId: context.taskId || null,
          },
        });
        return;
      }

      navigate("/student/tasks");
    }
  };

  const handleFollowBack = async (notification) => {
    const followerId = notification?.context?.followerId;

    if (!followerId || followLoadingIds.has(String(followerId))) {
      return;
    }

    const id = String(followerId);

    setFollowLoadingIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });

    try {
      await followUser(followerId);

      setFollowedBackIds((prev) => {
        const next = new Set(prev);
        next.add(id);
        return next;
      });

      toast.success("Followed back successfully.");
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          "Unable to follow back."
      );
    } finally {
      setFollowLoadingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const getActions = (notification) => {
    const context = notification?.context || {};
    const type = notification?.type;

    if (type === "message" && context.conversationId) {
      return [
        {
          key: "open-support",
          label: "Open Support",
          icon: <FiMessageCircle />,
          onClick: () => handleNotificationClick(notification),
        },
      ];
    }

    if (type === "message" && context.senderId) {
      return [
        {
          key: "reply",
          label: "Reply",
          icon: <FiMessageCircle />,
          onClick: () => handleNotificationClick(notification),
        },
      ];
    }

    if (
      type === "follow" &&
      context.followerId &&
      !followedBackIds.has(String(context.followerId))
    ) {
      return [
        {
          key: "follow-back",
          label: followLoadingIds.has(String(context.followerId))
            ? "Following..."
            : "Follow Back",
          icon: <FiUserPlus />,
          onClick: () => handleFollowBack(notification),
          disabled: followLoadingIds.has(String(context.followerId)),
        },
      ];
    }

    if (type === "certificate") {
      return [
        {
          key: "view",
          label: "View Certificate",
          icon: <FiArrowRight />,
          onClick: () => handleNotificationClick(notification),
        },
      ];
    }

    if (context.taskId || context.submissionId) {
      return [
        {
          key: "view",
          label: role === "admin" ? "Review Task" : "Open Task",
          icon: <FiArrowRight />,
          onClick: () => handleNotificationClick(notification),
        },
      ];
    }

    return [];
  };

  const handleDelete = async (event, id) => {
    event.stopPropagation();

    try {
      await removeNotification(id);
    } catch {
      // Provider handles the error.
    }
  };

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
            onClick={() => markAllAsRead()}
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
          notifications.map((item, index) => {
            const actions = getActions(item);

            return (
              <motion.div
                key={item._id}
                className={`notification-card ${
                  !item.isRead ? "unread" : ""
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.3,
                  delay: index * 0.05,
                }}
                whileHover={{ scale: 1.01 }}
                onClick={() => handleNotificationClick(item)}
              >
                <div className="notif-content">
                  <h4>{item.title}</h4>

                  <p>{item.message}</p>

                  <span className="notif-time">
                    {new Date(item.createdAt).toLocaleString()}
                  </span>

                  {actions.length > 0 && (
                    <div
                      className="notification-actions"
                      onClick={(event) => event.stopPropagation()}
                    >
                      {actions.map((action) => (
                        <button
                          key={action.key}
                          type="button"
                          className="notification-action-btn"
                          onClick={action.onClick}
                          disabled={action.disabled}
                        >
                          {action.icon}
                          <span>{action.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div
                  className={`read-status-dot ${
                    item.isRead ? "read" : ""
                  }`}
                />

                <button
                  type="button"
                  className="notification-delete-btn"
                  aria-label="Delete notification"
                  onClick={(event) =>
                    handleDelete(event, item._id)
                  }
                >
                  <FiTrash2 />
                </button>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
