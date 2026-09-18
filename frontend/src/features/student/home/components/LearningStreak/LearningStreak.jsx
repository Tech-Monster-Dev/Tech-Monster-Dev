import "./LearningStreak.css";
import { motion } from "framer-motion";

import {
  HiFire,
  HiBolt,
  HiArrowTrendingUp,
} from "react-icons/hi2";

const LearningStreak = ({ streak }) => {
  const days = streak?.days || 0;
  const progress = Math.min(
    Math.max(
      Number(streak?.progress) || 0,
      0
    ),
    100
  );

  return (
    <motion.section
      className="learning-streak"
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
      <div className="streak-glow"></div>

      <div className="streak-left">
        <motion.div
          className="fire-icon"
          animate={{
            rotate: [0, 8, -8, 0],
            scale: [1, 1.05, 1],
          }}
          transition={{
            repeat: Infinity,
            duration: 3,
          }}
        >
          <HiFire />
        </motion.div>

        <div>
          <h2>
            {days} Day Streak 🔥
          </h2>
          <p>
            Keep learning every day to
            maintain your streak.
          </p>
        </div>
      </div>

      <div className="streak-right">
        <div className="streak-progress">
          <motion.div
            className="streak-fill"
            initial={{
              width: 0,
            }}
            whileInView={{
              width: `${progress}%`,
            }}
            transition={{
              duration: 2,
            }}
          />
        </div>

        <div className="streak-footer">
          <span>
            <HiBolt />
            Weekly Goal
          </span>
          <strong>
            {progress}%
          </strong>
        </div>

        <motion.button
          type="button"
          whileHover={{
            scale: 1.05,
            y: -4,
          }}
          whileTap={{
            scale: 0.95,
          }}
          className="continue-streak-btn"
        >
          <HiArrowTrendingUp />
          Continue Streak
        </motion.button>
      </div>
    </motion.section>
  );
};
export default LearningStreak;