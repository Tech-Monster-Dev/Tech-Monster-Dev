import './AttendanceHeader.css';
import { motion } from 'framer-motion';
import StudentBadgeAvatar from '../../../../dashboard/common/StudentBadgeAvatar';

export default function AttendanceHeader({
  user,
  latestBadge = null,
  presentCount,
  absentCount
}) {
  const username =
    user?.username ||
    `${user?.firstName || ""} ${user?.lastName || ""}`.trim() ||
    "User";

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="user-info-container">
        <div className="user-profile-left">
          <StudentBadgeAvatar
            avatar={user?.avatar}
            latestBadge={latestBadge}
            alt="Profile"
            className="attendance-badge-avatar"
          />

          <div className="user-details">
            <h3>
              {username}
            </h3>
            <p>
              {user?.email || 'No email available'}
            </p>
          </div>
        </div>

        <div className="attendance-stats-right">
          <div className="stat-box present">
            <span className="label">
              Present Days
            </span>

            <span className="value">
              {presentCount}
            </span>
          </div>

          <div className="stat-box absent">
            <span className="label">
              Absent Days
            </span>

            <span className="value">
              {absentCount}
            </span>
          </div>

        </div>
      </div>
    </motion.div>
  );
}