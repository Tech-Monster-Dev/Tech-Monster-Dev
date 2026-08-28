import {
  useMemo,
  useState,
  useEffect
} from "react";

import { motion } from "framer-motion";

import "./CalendarGrid.css";

import WeekdayHeader from "../WeekdayHeader";
import CalendarDayCell from "../CalendarDayCell";

import {
  buildAttendanceMap,
  getDateKey
} from "../../utils/attendance.utils";

const getMonthInfo = (
  year,
  month
) => {
  const firstDayIndex =
    new Date(
      year,
      month,
      1
    ).getDay();

  const daysInMonth =
    new Date(
      year,
      month + 1,
      0
    ).getDate();

  return {
    firstDayIndex,
    daysInMonth
  };
};

const getMonthLabel = (
  year,
  month
) => {
  return new Date(
    year,
    month,
    1
  ).toLocaleString(
    "default",
    {
      month: "long",
      year: "numeric"
    }
  );
};

const getTodayInfo = () => {
  const now = new Date();

  return {
    year: now.getFullYear(),
    month: now.getMonth(),
    day: now.getDate()
  };
};

const getAccountCreationDate = (
  accountCreatedAt
) => {
  if (!accountCreatedAt) {
    return null;
  }

  const date =
    new Date(accountCreatedAt);

  return Number.isNaN(
    date.getTime()
  )
    ? null
    : date;
};

const getEnrollmentForDay = (
  enrollments,
  year,
  month,
  day
) => {
  return (
    enrollments.find(
      enrollment => {
        const date =
          new Date(
            enrollment.startedAt
          );

        return (
          !Number.isNaN(
            date.getTime()
          ) &&
          date.getFullYear() === year &&
          date.getMonth() === month &&
          date.getDate() === day
        );
      }
    ) || null
  );
};

export default function CalendarGrid({
  attendanceRecords = [],
  activeTimeData = {},
  accountCreatedAt,
  enrollments = [],
  onMonthlyCountsChange
}) {
  const todayInfo =
    useMemo(
      () => getTodayInfo(),
      []
    );

  const accountCreationDate =
    useMemo(
      () =>
        getAccountCreationDate(
          accountCreatedAt
        ),
      [accountCreatedAt]
    );

  const [visibleYear, setVisibleYear] =
    useState(todayInfo.year);

  const [visibleMonth, setVisibleMonth] =
    useState(todayInfo.month);

  const isCurrentMonth =
    visibleYear === todayInfo.year &&
    visibleMonth === todayInfo.month;

  const {
    firstDayIndex,
    daysInMonth
  } = getMonthInfo(
    visibleYear,
    visibleMonth
  );

  const attendanceMap =
    useMemo(
      () =>
        buildAttendanceMap(
          attendanceRecords,
          visibleYear,
          visibleMonth
        ),
      [
        attendanceRecords,
        visibleYear,
        visibleMonth
      ]
    );

  const monthStart =
    new Date(
      visibleYear,
      visibleMonth,
      1
    );

  const monthEnd =
    new Date(
      visibleYear,
      visibleMonth,
      daysInMonth
    );

  const accountCreatedTime =
    accountCreationDate?.getTime() || null;

  const monthIsBeforeAccountCreation =
    accountCreatedTime &&
    monthEnd.getTime() <
      accountCreatedTime;

  const monthIsAfterAccountCreation =
    !accountCreatedTime ||
    monthStart.getTime() >=
      accountCreatedTime;

  const currentMonthStart =
    new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1
    );

  const visibleMonthIsFuture =
    monthStart.getTime() >
    currentMonthStart.getTime();

  let countStartDay = 1;
  let countEndDay = daysInMonth;

  if (
    accountCreationDate &&
    visibleYear ===
      accountCreationDate.getFullYear() &&
    visibleMonth ===
      accountCreationDate.getMonth()
  ) {
    countStartDay =
      accountCreationDate.getDate();
  }

  if (isCurrentMonth) {
    countEndDay =
      todayInfo.day;
  }

  if (visibleMonthIsFuture) {
    countStartDay = 1;
    countEndDay = 0;
  }

  if (
    monthIsBeforeAccountCreation ||
    !accountCreationDate
  ) {
    countStartDay = 1;
    countEndDay = 0;
  }

  const presentDays =
    Object.keys(attendanceMap)
      .map(Number)
      .filter(
        day =>
          day >= countStartDay &&
          day <= countEndDay
      );

  const presentCount =
    presentDays.length;

  const absentCount =
    countEndDay >= countStartDay
      ? Math.max(
          0,
          countEndDay -
            countStartDay +
            1 -
            presentCount
        )
      : 0;

  useEffect(() => {
    onMonthlyCountsChange?.({
      presentCount,
      absentCount
    });
  }, [
    presentCount,
    absentCount,
    onMonthlyCountsChange
  ]);

  const goPreviousMonth = () => {
    if (accountCreationDate) {
      const accountYear =
        accountCreationDate.getFullYear();

      const accountMonth =
        accountCreationDate.getMonth();

      if (
        visibleYear === accountYear &&
        visibleMonth === accountMonth
      ) {
        return;
      }

      if (
        visibleYear < accountYear ||
        (
          visibleYear === accountYear &&
          visibleMonth < accountMonth
        )
      ) {
        return;
      }
    }

    setVisibleMonth(
      current => {
        if (current === 0) {
          setVisibleYear(
            year => year - 1
          );

          return 11;
        }

        return current - 1;
      }
    );
  };

  const goNextMonth = () => {
    setVisibleMonth(
      current => {
        if (current === 11) {
          setVisibleYear(
            year => year + 1
          );

          return 0;
        }

        return current + 1;
      }
    );
  };

  const days = [];

  for (
    let i = 0;
    i < firstDayIndex;
    i++
  ) {
    days.push({
      type: "empty"
    });
  }

  for (
    let day = 1;
    day <= daysInMonth;
    day++
  ) {
    const date =
      new Date(
        visibleYear,
        visibleMonth,
        day
      );

    const dateKey =
      getDateKey(date);

    const calendarDayStart =
      new Date(
        visibleYear,
        visibleMonth,
        day
      );

    const accountCreationDayStart =
      accountCreationDate
        ? new Date(
            accountCreationDate.getFullYear(),
            accountCreationDate.getMonth(),
            accountCreationDate.getDate()
          )
        : null;

    const isBeforeAccountCreation =
      accountCreationDayStart &&
      calendarDayStart.getTime() <
        accountCreationDayStart.getTime();

    const isFuture =
      date.getTime() >
      new Date().getTime();

    const enrollment =
      getEnrollmentForDay(
        enrollments,
        visibleYear,
        visibleMonth,
        day
      );

    const isAccountCreatedDay =
      accountCreationDate &&
      date.getFullYear() ===
        accountCreationDate.getFullYear() &&
      date.getMonth() ===
        accountCreationDate.getMonth() &&
      date.getDate() ===
        accountCreationDate.getDate();

    const isPresent =
      !isBeforeAccountCreation &&
      !isFuture &&
      attendanceMap[day] ===
        "present";

    const isAbsent =
      !isBeforeAccountCreation &&
      !isFuture &&
      !isAccountCreatedDay &&
      !isPresent &&
      date.getTime() >=
        (
          accountCreationDate?.getTime() ||
          Infinity
        );

    days.push({
      type: "day",
      day,
      date,
      dateKey,
      enrollment,
      isBeforeAccountCreation,
      isAccountCreatedDay,
      isPresent,
      isAbsent,
      activeMilliseconds:
        activeTimeData?.[dateKey] || 0
    });
  }

  const accountCreatedLabel =
    accountCreationDate
      ? accountCreationDate.toLocaleDateString(
          "en-IN",
          {
            day: "2-digit",
            month: "short",
            year: "numeric"
          }
        )
      : "";

  const accountCreatedTimeLabel =
    accountCreationDate
      ? accountCreationDate.toLocaleTimeString(
          "en-IN",
          {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true
          }
        )
      : "";

  const monthEnrollment =
    enrollments.find(
      enrollment => {
        const date =
          new Date(
            enrollment.startedAt
          );

        return (
          !Number.isNaN(
            date.getTime()
          ) &&
          date.getFullYear() ===
            visibleYear &&
          date.getMonth() ===
            visibleMonth
        );
      }
    );

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
      <div className="calendar-top-section">

        <div className="attendance-legend">

          <div>
            <span className="legend-dot present-dot" />
            Present
          </div>

          <div>
            <span className="legend-dot absent-dot" />
            Absent
          </div>

          <div>
            <span className="legend-dot enrollment-dot" />
            Enrolled
          </div>

          <div>
            <span className="legend-dot account-dot" />
            Account Created
          </div>

          <div>
            <span className="legend-dot muted-dot" />
            Before Account
          </div>

        </div>

        <div className="month-navigation">

          <button
            type="button"
            className="month-nav-button"
            onClick={goPreviousMonth}
            aria-label="Previous month"
          >
            ‹
          </button>

          <h2>
            {getMonthLabel(
              visibleYear,
              visibleMonth
            )}
          </h2>

          <button
            type="button"
            className="month-nav-button"
            onClick={goNextMonth}
            aria-label="Next month"
          >
            ›
          </button>

        </div>

        <div className="month-summary">

          <h3>
            {getMonthLabel(
              visibleYear,
              visibleMonth
            )}{" "}
            Summary
          </h3>

          <div className="month-summary-values">

            <div>
              <span>Present</span>
              <strong className="summary-present">
                {presentCount}
              </strong>
            </div>

            <div>
              <span>Absent</span>
              <strong className="summary-absent">
                {absentCount}
              </strong>
            </div>

            <div>
              <span>Total Days</span>
              <strong>
                {presentCount +
                  absentCount}
              </strong>
            </div>

          </div>

          {accountCreationDate && (
            <small>
              Tracking from{" "}
              {accountCreatedLabel}
            </small>
          )}

        </div>

      </div>

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

      <div className="days-grid">

        {days.map(
          (item, index) => {
            if (
              item.type ===
              "empty"
            ) {
              return (
                <div
                  key={`empty-${index}`}
                  className="day-cell empty"
                />
              );
            }

            return (
              <CalendarDayCell
                key={item.day}
                day={item.day}
                activeMilliseconds={
                  item.activeMilliseconds
                }
                today={
                  isCurrentMonth
                    ? todayInfo.day
                    : null
                }
                isBeforeAccountCreation={
                  item.isBeforeAccountCreation
                }
                isAccountCreatedDay={
                  item.isAccountCreatedDay
                }
                isPresent={
                  item.isPresent
                }
                isAbsent={
                  item.isAbsent
                }
                enrollment={
                  item.enrollment
                }
              />
            );
          }
        )}

      </div>

      {accountCreationDate && (
        <div className="attendance-boundary-note">
          <span>ⓘ</span>
          Attendance is counted from your
          account creation date (
          {accountCreatedLabel}
          ). Dates before account creation
          are muted and are not included.
        </div>
      )}

    </motion.div>
  );
}
