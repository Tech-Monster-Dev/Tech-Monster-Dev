import "./CalendarDayCell.css";

import { motion } from "framer-motion";

const formatActiveTime = (
  totalMilliseconds = 0
) => {
  const milliseconds = Math.max(0, Math.floor(totalMilliseconds));
  const hours = String(Math.floor(milliseconds / 3600000)).padStart(2, "0");
  const minutes = String(Math.floor((milliseconds % 3600000) / 60000)).padStart(2, "0");
  const seconds = String(Math.floor((milliseconds % 60000) / 1000)).padStart(2, "0");

  return `${hours}:${minutes}:${seconds}`;
};

export default function CalendarDayCell({
  day,
  activeMilliseconds,
  today,
  isBeforeAccountCreation,
  isAccountCreatedDay,
  isPresent,
  isAbsent,
  enrollment
}) {
  let statusClass = "";

  if (
    isBeforeAccountCreation
  ) {
    statusClass = "before-account";
  } else if (
    enrollment
  ) {
    statusClass = "enrollment-day";
  } else if (
    isAccountCreatedDay
  ) {
    statusClass = "account-created-day";
  } else if (
    isPresent
  ) {
    statusClass = "present";
  } else if (
    isAbsent
  ) {
    statusClass = "absent";
  }

  const isToday = today === day && !isBeforeAccountCreation;

  return (
    <motion.div
      whileHover={{
        scale: 1.04
      }}
      whileTap={{
        scale: 0.97
      }}
      title={
        isBeforeAccountCreation
          ? "Before Account Creation"
          : isAccountCreatedDay
            ? "Account Created"
            : enrollment
              ? enrollment.type === "course"
                ? "Course Enrollment"
                : "Internship Enrollment"
              : isPresent
                ? "Present"
                : isAbsent
                  ? "Absent"
                  : undefined
      }
      className={`day-cell ${statusClass} ${isToday
        ? "current-day"
        : ""
        }`}
    >
      <span className="calendar-day-number">
        {day}
      </span>

      {activeMilliseconds > 0 && !isBeforeAccountCreation && (
        <span className="active-time">
          {formatActiveTime(
            activeMilliseconds
          )}
        </span>
      )}

      {enrollment && (
        <span className="enrollment-time">
          {new Date(
            enrollment.startedAt
          ).toLocaleTimeString(
            "en-IN",
            {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true
            }
          )}
        </span>
      )}
    </motion.div>
  );
}