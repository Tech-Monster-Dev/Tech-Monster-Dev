import "./SuggestedUsers.css";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { motion } from "framer-motion";

import EmptyState from "../../../../../components/ui/EmptyState";
import DashButton from "../../../../../components/ui/Button/DashButton";
import StudentBadgeAvatar from "../../../../dashboard/common/StudentBadgeAvatar";

import { followUser, unfollowUser } from "../../../../../services/api/follow.service";

import {
  HiUsers,
  HiArrowRight,
} from "react-icons/hi2";

const SuggestedUsers = ({
  users = [],
  onlineUsers = [],
}) => {
  const navigate = useNavigate();

  const [followStates, setFollowStates] = useState({});
  const [actionLoading, setActionLoading] = useState({});

  const handleFollowToggle = async (userId) => {
    if (!userId || actionLoading[userId]) {
      return;
    }

    const isFollowing = Object.prototype.hasOwnProperty.call(followStates, userId) ? followStates[userId] : !!users.find((user) => String(user?._id) === String(userId))?.isFollowing;

    setActionLoading((current) => ({
      ...current,
      [userId]: true,
    }));

    try {
      if (isFollowing) {
        await unfollowUser(userId);
      } else {
        await followUser(userId);
      }

      setFollowStates((current) => ({
        ...current,
        [userId]: !isFollowing,
      }));
    } catch (error) {
      console.error("Suggested user follow action failed:", error);
      toast.error(
        error.response?.data?.message ||
        "Unable to update follow status"
      );
    } finally {
      setActionLoading((current) => ({
        ...current,
        [userId]: false,
      }));
    }
  };

  const handleViewProfile = (userId) => {
    if (!userId) {
      return;
    }

    navigate(`/student/user-profile/${userId}`);
  };

  return (
    <motion.section
      className="suggested-users"
      initial={{
        opacity: 0,
        y: 80,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
      }}
      viewport={{
        once: true,
      }}
      transition={{
        duration: 0.8,
      }}
    >
      <div className="users-header">
        <div>
          <h2>
            <HiUsers />
            Suggested Users
          </h2>

          <p>
            Connect with learners having
            similar interests.
          </p>
        </div>

        <DashButton
          type="button"
          variant="outline"
          size="small"
          icon={<HiArrowRight />}
          iconPosition="right"
          className="view-all-users"
          disabled
          title="Student user directory is not available yet"
        >
          View All
        </DashButton>
      </div>

      {users.length === 0 ? (
        <EmptyState
          heading="No Suggested Users"
          paragraph="More suggestions will appear as you complete your profile."
        />
      ) : (
        <div className="users-grid">
          {users.map((user, index) => {
            const userId = user?._id;
            const isFollowing = Object.prototype.hasOwnProperty.call(followStates, userId) ? followStates[userId] : !!user?.isFollowing;
            const isLoading = !!actionLoading[userId];
            const isOnline = onlineUsers.some(
              (onlineUserId) => String(onlineUserId) === String(userId)
            );

            return (
              <motion.article
                key={userId || index}
                className="user-card"
                initial={{
                  opacity: 0,
                  y: 50,
                }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: index * 0.15,
                }}
              >
                <div className="user-top">
                  <div className="user-avatar">
                    <StudentBadgeAvatar
                      avatar={user?.avatar}
                      latestBadge={user?.latestBadge}
                      alt={user?.fullName || "User"}
                      className="suggested-user-badge-avatar"
                    />

                    {isOnline && <span className="online-dot" aria-label="Online" title="Online" />}
                  </div>

                  <div className="user-info">
                    <h3>
                      {user?.fullName || "Unknown User"}
                    </h3>

                    <p>
                      Learner
                    </p>
                  </div>
                </div>

                {user?.skills?.length > 0 && (
                  <div className="user-skills">
                    {user.skills
                      .slice(0, 6)
                      .map((skill, i) => (
                        <span key={`${skill}-${i}`}>
                          {skill}
                        </span>
                      ))}
                  </div>
                )}

                <div className="user-buttons">
                  <DashButton
                    type="button"
                    variant={isFollowing ? "secondary" : "primary"}
                    size="small"
                    onClick={() => handleFollowToggle(userId)}
                    disabled={!userId || isLoading}
                    loading={isLoading}
                    loadingText="Please wait..."
                    className="suggested-user-action-button"
                  >
                    {isFollowing ? "Following" : "+ Follow"}
                  </DashButton>

                  <DashButton
                    type="button"
                    variant="outline"
                    size="small"
                    icon={<HiArrowRight />}
                    iconPosition="right"
                    onClick={() => handleViewProfile(userId)}
                    disabled={!userId}
                    className="suggested-user-action-button"
                  >
                    View Profile
                  </DashButton>
                </div>
              </motion.article>
            );
          })}
        </div>
      )}
    </motion.section>
  );
};

export default SuggestedUsers;