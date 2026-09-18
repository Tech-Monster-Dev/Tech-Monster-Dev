import "./LearningAnalytics.css";
import { motion } from "framer-motion";

import {
  HiChartBar,
  HiClock,
  HiAcademicCap,
  HiArrowTrendingUp,
} from "react-icons/hi2";

const LearningAnalytics = ({ analytics }) => {
  const weeklyData =
    analytics?.weeklyData?.length === 7
      ? analytics.weeklyData
      : [0, 0, 0, 0, 0, 0, 0];

  const completedCourses = analytics?.completedCourses || 0;
  const hours = analytics?.hours || 0;
  const growth = analytics?.growth || 0;

  return (
    <motion.section
      className="analytics-card"
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
      <div className="analytics-glow"></div>
      <div className="analytics-header">
        <div>
          <h2>
            <HiChartBar />
            Learning Analytics
          </h2>
          <p>
            Weekly learning performance overview
          </p>
        </div>
      </div>

      <div className="analytics-body">
        <div className="chart-wrapper">
          <div className="chart-bars">
            {weeklyData.map(
              (value, index) => {
                const safeHeight =
                  Math.min(
                    Math.max(
                      Number(value) || 0,
                      0
                    ),
                    100
                  );
                return (
                  <motion.div
                    key={index}
                    className="chart-bar"
                    initial={{
                      height: 0,
                    }}
                    whileInView={{
                      height:
                        `${safeHeight}%`,
                    }}
                    transition={{
                      delay:
                        index * 0.12,
                      duration: 0.7,
                    }}
                  >
                    <span>
                      {
                        [
                          "M",
                          "T",
                          "W",
                          "T",
                          "F",
                          "S",
                          "S",
                        ][index]
                      }
                    </span>
                  </motion.div>
                );
              }
            )}
          </div>
        </div>

        <div className="analytics-info">
          <div className="analytics-item">
            <HiAcademicCap />
            <div>
              <h3>
                {completedCourses}
              </h3>
              <p>
                Completed Internships
              </p>
            </div>
          </div>

          <div className="analytics-item">
            <HiClock />
            <div>
              <h3>
                {hours}h
              </h3>
              <p>
                Learning Hours
              </p>
            </div>
          </div>

          <div className="analytics-item">
            <HiArrowTrendingUp />
            <div>
              <h3>
                {growth}%
              </h3>
              <p>
                Weekly Growth
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
};
export default LearningAnalytics;