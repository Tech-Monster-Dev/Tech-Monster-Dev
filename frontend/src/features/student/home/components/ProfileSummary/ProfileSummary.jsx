import "./ProfileSummary.css";

import { motion } from "framer-motion";

import {
  HiCheckBadge,
  HiEnvelope,
  HiUserCircle,
} from "react-icons/hi2";

import { useRouter } from "next/navigation";
import useAuth from "../../../../../shared/hooks/useAuth";

import DashButton from "../../../../../components/ui/Button/DashButton";
import StudentBadgeAvatar from "../../../../dashboard/common/StudentBadgeAvatar";

const ProfileSummary = ({ username, latestBadge = null }) => {

  const router = useRouter();
  const { user } = useAuth();

  const skills =
    Array.isArray(username?.skills)
      ? username.skills
      : [];

  const progress = Math.min(
    Math.max(
      Number(username?.profileCompletion) || 0,
      0
    ),
    100
  );


  const displayName =
    username?.fullName?.trim()
      ? username.fullName
      : user?.username
        ? user.username.charAt(0).toUpperCase() +
        user.username.slice(1)
        : "Student";


  return (
    <section
      className="profile-summary"
    >

      <div className="profile-glow profile-glow-one"></div>
      <div className="profile-glow profile-glow-two"></div>

      <div className="profile-left">
        <motion.div
          className="profile-image"
          whileHover={{
            rotate: 3,
            scale: 1.05,
          }}
        >
          <StudentBadgeAvatar
            avatar={username?.avatar}
            latestBadge={latestBadge}
            alt="Profile"
            className="profile-summary-badge-avatar"
          />
        </motion.div>

        <div className="profile-info">
          <h2>
            {displayName}
          </h2>
          <p>
            <HiEnvelope />
            {username?.email || "Email not available"}
          </p>

          {skills.length > 0 && (
            <div className="skills-wrapper">
              {skills.map(
                (skill, index) => (
                  <motion.span
                    key={`${skill}-${index}`}
                    className="skill-chip"
                  >
                    {skill}
                  </motion.span>
                )
              )}
            </div>
          )}
        </div>
      </div>

      <div
        className="profile-divider"
      />

      <div className="profile-right">
        <div className="progress-title">
          <HiCheckBadge />
          <span>
            Profile Completion
          </span>
        </div>

        <div className="progress-bar">
          <motion.div
            className="progress-fill"
            initial={{
              width: 0,
            }}
            whileInView={{
              width: `${progress}%`,
            }}
            transition={{
              duration: 1.5,
            }}
          />
        </div>

        <h1>
          {progress}%
        </h1>

        <p>
          Complete your remaining profile
          details to unlock all platform
          features.
        </p>

        <DashButton
          type="button"
          variant="primary"
          size="medium"
          icon={<HiUserCircle />}
          iconPosition="left"
          onClick={() => router.push("/student/account")}
        >
          {progress === 100 ? "Completed" : "Complete Profile"}
        </DashButton>
      </div>
    </section>
  );
};

export default ProfileSummary;