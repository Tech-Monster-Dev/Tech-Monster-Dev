import "./ProfileSummary.css";

import { motion } from "framer-motion";

import {
  HiCheckBadge,
  HiEnvelope,
  HiUserCircle,
} from "react-icons/hi2";

import { useNavigate } from "react-router-dom";

import defaultProfileImage from "../../../../../assets/profile/default-profile.svg";

import useAuth from "../../../../../shared/hooks/useAuth";


const ProfileSummary = ({ username }) => {

  const navigate = useNavigate();
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
    <motion.section
      className="profile-summary"

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
        amount: 0.3,
      }}

      transition={{
        duration: 0.7,
      }}
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
          <img
            src={
              username?.avatar ||
              defaultProfileImage
            }
            alt={`${displayName} profile`}
            onError={(event) => {
              event.currentTarget.src =
                defaultProfileImage;
            }}
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

                    initial={{
                      opacity: 0,
                      scale: 0.8,
                    }}

                    whileInView={{
                      opacity: 1,
                      scale: 1,
                    }}

                    transition={{
                      delay:
                        index * 0.08,
                    }}
                  >
                    {skill}
                  </motion.span>
                )
              )}

            </div>
          )}

        </div>

      </div>


      <motion.div
        className="profile-divider"

        initial={{
          scaleY: 0,
        }}

        whileInView={{
          scaleY: 1,
        }}

        transition={{
          duration: 0.7,
        }}
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


        <motion.button
          type="button"

          whileHover={{
            scale: 1.05,
            y: -3,
          }}

          whileTap={{
            scale: 0.95,
          }}

          className="complete-btn"

          onClick={() =>
            navigate("/student/account")
          }
        >

          <HiUserCircle />

          {progress === 100
            ? "Completed"
            : "Complete Profile"}

        </motion.button>

      </div>

    </motion.section>
  );
};

export default ProfileSummary;