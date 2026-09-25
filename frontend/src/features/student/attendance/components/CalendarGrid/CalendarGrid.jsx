import "./CalendarGrid.css";
import { motion } from "framer-motion";

import WeekdayHeader from "./components/WeekdayHeader";
import CalendarHeader from "./components/CalendarHeader";
import CalendarDays from "./components/CalendarDays";
import useCalendarGrid from "./hooks/useCalendarGrid";

export default function CalendarGrid({
  attendanceRecords = [],
  activeTimeData = {},
  accountCreatedAt,
  enrollments = [],
  onMonthlyCountsChange
}) {

  const {
    todayInfo,
    visibleYear,
    visibleMonth,
    isCurrentMonth,
    goPreviousMonth,
    goNextMonth,
    getMonthLabel,
    presentCount,
    absentCount,
    accountCreationDate,
    accountCreatedLabel,
    accountCreatedTimeLabel,
    monthEnrollment,
    days
  } = useCalendarGrid({
    attendanceRecords,
    activeTimeData,
    accountCreatedAt,
    enrollments,
    onMonthlyCountsChange
  });

  return (
    <motion.div
      className="calendar-container"
      initial={{
        opacity: 0,
        y: 20
      }}
      animate={{
        opacity: 1,
        y: 0
      }}
      transition={{
        duration: 0.5
      }}
    >
      <CalendarHeader
        visibleYear={visibleYear}
        visibleMonth={visibleMonth}
        getMonthLabel={getMonthLabel}
        goPreviousMonth={goPreviousMonth}
        goNextMonth={goNextMonth}
        presentCount={presentCount}
        absentCount={absentCount}
        accountCreationDate={accountCreationDate}
        accountCreatedLabel={accountCreatedLabel}
      />

      <div className="calendar-event-info">
        {monthEnrollment && (
          <div className="calendar-enrollment-info">
            🎓 Joined{" "}
            {monthEnrollment.type ===
              "course"
              ? "Course"
              : "Internship"}{" "}
            on{" "}
            {new Date(
              monthEnrollment.startedAt
            ).toLocaleDateString(
              "en-IN",
              {
                day: "2-digit",
                month: "short",
                year: "numeric"
              }
            )}{" "}
            at{" "}
            {new Date(
              monthEnrollment.startedAt
            ).toLocaleTimeString(
              "en-IN",
              {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true
              }
            )}
          </div>
        )}

        {accountCreationDate &&
          visibleYear ===
          accountCreationDate.getFullYear() &&
          visibleMonth ===
          accountCreationDate.getMonth() && (
            <div className="calendar-account-info">
              👤 Account Created on{" "}
              {accountCreatedLabel} at{" "}
              {accountCreatedTimeLabel}
            </div>
          )}

      </div>

      <WeekdayHeader />

      <CalendarDays
        days={days}
        isCurrentMonth={isCurrentMonth}
        today={todayInfo}
      />

      {accountCreationDate && (
        <div className="attendance-boundary-note">
          <div>
            <span>ⓘ</span>
            Attendance is counted from your account creation date ({accountCreatedLabel}). Dates before account creation are muted and are not included.
          </div>
        </div>
      )}

    </motion.div>
  );
}