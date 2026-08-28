import "./CalendarDayCell.css";

import { motion } from "framer-motion";

const formatActiveTime = (
  totalMilliseconds = 0
) => {
  const milliseconds =
    Math.max(
      0,
      Math.floor(
        totalMilliseconds
      )
    );

  const hours =
    Math.floor(
      milliseconds /
        3600000
    );

  const minutes =
    Math.floor(
      (
        milliseconds %
        3600000
      ) / 60000
    );

  const seconds =
    Math.floor(
      (
        milliseconds %
        60000
      ) / 1000
    );

  return `${String(
    hours
  ).padStart(
    2,
    "0"
  )}:${String(
    minutes
  ).padStart(
    2,
    "0"
  )}:${String(
    seconds
  ).padStart(
    2,
    "0"
  )}`;
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
  let statusClass =
    "";

  if (
    isBeforeAccountCreation
  ) {
    statusClass =
      "before-account";
  } else if (
    enrollment
  ) {
    statusClass =
      "enrollment-day";
  } else if (
    isAccountCreatedDay
  ) {
    statusClass =
      "account-created-day";
  } else if (
    isPresent
  ) {
    statusClass =
      "present";
  } else if (
    isAbsent
  ) {
    statusClass =
      "absent";
  }

  const isToday =
    today === day &&
    !isBeforeAccountCreation;

  return (
    <motion.div
      whileHover={{
        scale: 1.04
      }}
      whileTap={{
        scale: 0.97
      }}
      className={`day-cell ${statusClass} ${
        isToday
          ? "current-day"
          : ""
      }`}
    >
      <span className="calendar-day-number">
        {day}
      </span>

      {isAccountCreatedDay && (
        <span className="day-status-label">
          Account Created
        </span>
      )}

      {enrollment && (
        <span className="day-status-label">
          🎓{" "}
          {enrollment.type ===
          "course"
            ? "Course"
            : "Internship"}
        </span>
      )}

      {isPresent && (
        <span className="day-status-label">
          Present
        </span>
      )}

      {isAbsent && (
        <span className="day-status-label">
          Absent
        </span>
      )}

      {activeMilliseconds > 0 &&
        !isBeforeAccountCreation && (
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
