import "./Notification.css";
import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
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
import { getSubmissionByTaskId } from "../../../../services/api/adminTask.service";


export default function Notification() {
  const router = useRouter();
  const pathname = usePathname();
  const navigateWithState = (path, state) => {
    if (state) sessionStorage.setItem("tech-monster-navigation-state", JSON.stringify(state));
    router.push(path);
  };
  const autoReadTriggered = useRef(false);
  const notificationReadInFlight = useRef(new Set());
  const notificationDeleteInFlight = useRef(new Set());
  const markAllAsReadInFlight = useRef(false);

  const handleMarkAllAsRead = async () => {
    if (markAllAsReadInFlight.current) return;

    markAllAsReadInFlight.current = true;
    try {
      await markAllAsRead();
    } finally {
      markAllAsReadInFlight.current = false;
    }
  };

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

  const role = pathname.startsWith("/admin") ? "admin" : "student";

  useEffect(() => {
    if (
      !loading &&
      unreadCount > 0 &&
      !autoReadTriggered.current
    ) {
      autoReadTriggered.current = true;
      handleMarkAllAsRead().catch(() => {
        autoReadTriggered.current = false;
      });
    }
  }, [loading, unreadCount, markAllAsRead]);

  const handleNotificationClick = async (notification) => {
    if (!notification?.isRead) {
      const notificationId = String(notification?._id || "");
      if (!notificationId || notificationReadInFlight.current.has(notificationId)) return;
      notificationReadInFlight.current.add(notificationId);
      try {
        await markAsRead(notification._id);
      } catch {
        return;
      } finally {
        notificationReadInFlight.current.delete(notificationId);
      }
    }

    const context = notification.context || {};
    const type = notification.type;

    if (type === "message" && context.conversationId) {
      navigateWithState(role === "admin" ? "/admin/support" : "/student/help&support", { notificationConversationId: String(context.conversationId) });
      return;
    }

    if (type === "message" && context.senderId) {
      navigateWithState(`/${role}/message`, { notificationUserId: String(context.senderId), notificationMessageId: context.messageId ? String(context.messageId) : null });
      return;
    }

    if (type === "follow" && context.followerId) {
      router.push(`/student/user-profile/${context.followerId}`);
      return;
    }

    if (type === "certificate") {
      const programId = context.programId || context.internshipId || context.courseId;

      if (programId) {
        navigateWithState("/student/certificate", { programId: String(programId), programType: context.programType || null });
        return;
      }

      router.push("/student/certificate");
      return;
    }

    if (context.taskId) {
      if (role === "admin") {
        if (context.submissionId) {
          router.push(`/admin/tasks/${context.submissionId}`);
          return;
        }

        try {
          const res = await getSubmissionByTaskId(context.taskId);

          if (res?.submission?._id) {
            router.push(`/admin/tasks/${res.submission._id}`);
            return;
          }
        } catch {
          // Fall back to legacy Task notification.
        }

        router.push(`/admin/tasks/${context.taskId}`);
        return;
      }

      if (context.courseSlug) {
        const type =
          context.internshipId && !context.courseId
            ? "internship"
            : "course";

        navigateWithState(`/student/tasks/${type}/${context.courseSlug}`, { moduleId: context.moduleId || null, lessonId: context.lessonId || null, taskId: context.taskId });
        return;
      }

      router.push("/student/tasks");
      return;
    }

    if (context.submissionId) {
      if (role === "admin") {
        router.push(`/admin/tasks/${context.submissionId}`);
        return;
      }

      if (context.courseSlug) {
        const type =
          context.internshipId && !context.courseId
            ? "internship"
            : "course";

        navigateWithState(`/student/tasks/${type}/${context.courseSlug}`, { moduleId: context.moduleId || null, lessonId: context.lessonId || null, taskId: context.taskId || null });
        return;
      }

      router.push("/student/tasks");
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
    const notificationId = String(id || "");
    if (!notificationId || notificationDeleteInFlight.current.has(notificationId)) return;
    notificationDeleteInFlight.current.add(notificationId);

    try {
      await removeNotification(id);
    } catch {
      // Provider handles the error.
    } finally {
      notificationDeleteInFlight.current.delete(notificationId);
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
            onClick={handleMarkAllAsRead}
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
                className={`notification-card ${!item.isRead ? "unread" : ""
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
                  className={`read-status-dot ${item.isRead ? "read" : ""}`}
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