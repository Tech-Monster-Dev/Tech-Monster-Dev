export const getCalendarMonthInfo = () => {
  const date = new Date();

  const year = date.getFullYear();
  const month = date.getMonth();

  return {
    year,
    month,
    today: date.getDate(),
    currentMonthName: date.toLocaleString(
      "default",
      {
        month: "long",
        year: "numeric"
      }
    ),
    daysInMonth: new Date(
      year,
      month + 1,
      0
    ).getDate(),
    firstDayIndex: new Date(
      year,
      month,
      1
    ).getDay()
  };
};

export const getFirstAttendanceDay = (
  firstAttendanceDate,
  year,
  month
) => {
  if (!firstAttendanceDate) {
    return 1;
  }

  const date = new Date(
    firstAttendanceDate
  );

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month
  ) {
    return 1;
  }

  return date.getDate();
};

export const getJoinedDateInfo = (
  accountCreatedAt,
  year,
  month
) => {
  if (!accountCreatedAt) {
    return {
      date: null,
      day: null,
      dateLabel: "",
      timeLabel: ""
    };
  }

  const date = new Date(accountCreatedAt);

  if (Number.isNaN(date.getTime())) {
    return {
      date: null,
      day: null,
      dateLabel: "",
      timeLabel: ""
    };
  }

  const isCurrentMonth =
    date.getFullYear() === year &&
    date.getMonth() === month;

  return {
    date,
    day: isCurrentMonth
      ? date.getDate()
      : null,
    dateLabel: date.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric"
      }
    ),
    timeLabel: date.toLocaleTimeString(
      "en-IN",
      {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
      }
    )
  };
};

export const createCalendarDays = ({
  firstDayIndex,
  daysInMonth,
  attendanceData,
  activeTimeData,
  firstAttendanceDay,
  today
}) => {
  const days = [];

  for (
    let index = 0;
    index < firstDayIndex;
    index++
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
    let status = attendanceData?.[day];

    if (!status) {
      status =
        day < firstAttendanceDay
          ? "pending"
          : day < today
            ? "absent"
            : "pending";
    }

    days.push({
      type: "day",
      day,
      status,
      activeMilliseconds:
        activeTimeData?.[day] || 0
    });
  }

  return days;
};
