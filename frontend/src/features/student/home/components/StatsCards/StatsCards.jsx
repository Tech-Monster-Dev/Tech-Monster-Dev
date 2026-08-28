import "./StatsCards.css";

import { motion } from "framer-motion";

import {
  HiAcademicCap,
  HiCalendarDays,
  HiCheckCircle,
  HiTrophy,
} from "react-icons/hi2";


const StatsCards = ({ stats }) => {

  const totalinternships = stats?.internships?.total || 0;
  const totalCourses = stats?.courses?.total || 0;
  const showTotalJoinInternshipandCourses = `${totalinternships} / ${totalCourses}`;

  const data = [
    {
      id: "internships",
      title: "Internships/Courses",
      value: showTotalJoinInternshipandCourses,
      suffix: "",
      icon: HiAcademicCap,
      color: "#00E5FF",
    },
    {
      id: "attendance",
      title: "Attendance",
      value: stats?.attendance?.present || 0,
      suffix: "",
      icon: HiCalendarDays,
      color: "#10B981",
    },
    {
      id: "tasks",
      title: "Daily Tasks",
      value: stats?.tasks?.approved || 0,
      suffix: "",
      icon: HiCheckCircle,
      color: "#F59E0B",
    },
    {
      id: "badges",
      title: "Earned Badges",
      value: stats?.badges || 0,
      suffix: "",
      icon: HiTrophy,
      color: "#EC4899",
    },
  ];


  return (
    <div className="stats-grid">

      {data.map((item, index) => {

        const Icon = item.icon;

        return (
          <motion.div
            key={item.id}
            className="stats-card"

            initial={{
              opacity: 0,
              y: 70,
            }}

            whileInView={{
              opacity: 1,
              y: 0,
            }}

            viewport={{
              once: true,
              amount: 0.25,
            }}

            transition={{
              delay: index * 0.15,
              duration: 0.6,
            }}

            whileHover={{
              y: -8,
              scale: 1.02,
            }}
          >

            <div
              className="stats-icon"
              style={{
                background: item.color,
              }}
            >
              <Icon />
            </div>

            <h4>
              {item.title}
            </h4>

            <h2>
              {item.value}
              {item.suffix}
            </h2>

            <div
              className="stats-line"
              style={{
                background: item.color,
              }}
            />

          </motion.div>
        );
      })}

    </div>
  );
};

export default StatsCards;