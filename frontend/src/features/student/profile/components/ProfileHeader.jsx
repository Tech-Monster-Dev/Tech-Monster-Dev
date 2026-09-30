import { motion } from 'framer-motion';

import StudentBadgeAvatar from '../../../dashboard/common/StudentBadgeAvatar';

export default function ProfileHeader({ user, latestBadge = null, followersCount, followingCount, isOnline = false }) {
  const fullName = `${user?.firstName || ''} ${user?.middleName || ''} ${user?.lastName || ''}`.trim() || user?.username;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="student-profile-card student-profile-header"
    >
      <div className="student-profile-avatar-wrapper">
        <StudentBadgeAvatar
          avatar={user?.avatar}
          latestBadge={latestBadge}
          alt={user?.username || "Profile"}
          className="student-profile-badge-avatar"
        />
        {isOnline && <span className="student-profile-status-dot" aria-label="Online" title="Online"></span>}
      </div>

      <div className="student-profile-header-details">
        <h2 className="student-profile-name">{fullName}</h2>
        <p className="student-profile-username">@{user?.username}</p>
        <p className="student-profile-bio">
          {user?.bio || "No bio available"}
        </p>

        <div className="student-profile-stats">
          <div className="student-profile-stat">
            <span className="student-profile-stat-number">{followersCount}</span>
            <span className="student-profile-stat-label">Followers</span>
          </div>
          <div className="student-profile-stat-divider" />
          <div className="student-profile-stat">
            <span className="student-profile-stat-number">{followingCount}</span>
            <span className="student-profile-stat-label">Following</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}