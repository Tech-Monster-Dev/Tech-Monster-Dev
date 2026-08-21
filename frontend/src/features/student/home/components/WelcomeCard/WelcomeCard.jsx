import "./WelcomeCard.css";

import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import useAuth from "../../../../../shared/hooks/useAuth";

import {
  HiFire,
  HiAcademicCap,
  HiTrophy,
  HiSun,
  HiArrowRight,
} from "react-icons/hi2";


const WelcomeCard = ({
  username,
  stats,
  streak,
}) => {

  console.log("Welcome card Stats",stats)

  const { user } = useAuth();
  const navigate = useNavigate();

  const hour = new Date().getHours();

  let greeting = "Good Evening";

  if (hour < 12) {
    greeting = "Good Morning";
  } else if (hour < 17) {
    greeting = "Good Afternoon";
  }

  const displayName =
    username?.fullName?.trim()
      ? username.fullName
      : user?.username
        ? user.username.charAt(0).toUpperCase() +
        user.username.slice(1)
        : "Student";

  const internshipCount = stats?.internships?.total || 0;
  const courseCount = stats?.courses?.total || 0;

  const badgeCount = stats?.badges || 0;

  const streakDays = streak?.days || 0;


  return (
    <motion.section
      className="welcome-card"
      initial={{
        opacity: 0,
        y: 50,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.8,
      }}
    >

      <div className="welcome-glow"></div>

      <div className="welcome-left">

        <div className="welcome-content">

          <span className="welcome-badge">

            <span className="welcome-badge-icon">
              <HiSun />
            </span>

            {greeting}

          </span>

          <h1>
            Welcome Back,
            <span>
              {displayName}
            </span>
          </h1>

          <p>
            Continue your learning journey and
            complete today's goals.
          </p>

        </div>

        <motion.button
          type="button"
          className="welcome-btn"
          whileHover={{
            scale: 1.05,
            x: 5,
          }}
          whileTap={{
            scale: 0.97,
          }}
          onClick={() =>
            navigate("/student/dashboard")
          }
        >
          Continue Learning
          <HiArrowRight />
        </motion.button>

      </div>


      <div className="welcome-right">

        <motion.div
          className="welcome-mini-card"
          whileHover={{
            y: -8,
          }}
        >
          <HiFire />

          <div>
            <h2>{streakDays}</h2>
            <span>Day Streak</span>
          </div>
        </motion.div>


        <motion.div
          className="welcome-mini-card"
          whileHover={{
            y: -8,
          }}
        >
          <HiAcademicCap />

          <div>
            <h2>{internshipCount} / {courseCount}</h2>
            <span>Internships/Courses</span>
          </div>
        </motion.div>


        <motion.div
          className="welcome-mini-card"
          whileHover={{
            y: -8,
          }}
        >
          <HiTrophy />

          <div>
            <h2>{badgeCount}</h2>
            <span>Badges</span>
          </div>
        </motion.div>

      </div>

    </motion.section>
  );
};

export default WelcomeCard;