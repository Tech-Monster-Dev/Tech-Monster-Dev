import { ATTENDANCE_STATUS } from "../constants/attendance.constants";

export const getDateKey = dateValue => {
  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0")
  ].join("-");
};

export const getCurrentMonthContext = () => {
  const date = new Date();

  return {
    year: date.getFullYear(),
    month: date.getMonth(),
    today: date.getDate()
  };
};

export const buildAttendanceMap = (
  records = [],
  year,
  month
) => {
  const map = {};

  records.forEach(record => {
    const date = new Date(
      record.createdAt || record.date
    );

    if (Number.isNaN(date.getTime())) {
      return;
    }

    if (
      date.getFullYear() !== year ||
      date.getMonth() !== month
    ) {
      return;
    }

    if (
      String(record.status || "").toLowerCase() ===
      "present"
    ) {
      map[date.getDate()] =
        ATTENDANCE_STATUS.PRESENT;
    }
  });

  return map;
};

export const getAttendanceStartDay = (
  accountCreatedAt,
  year,
  month
) => {
  if (!accountCreatedAt) {
    return 1;
  }

  const date = new Date(accountCreatedAt);

  if (Number.isNaN(date.getTime())) {
    return 1;
  }

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month
  ) {
    return 1;
  }

  return date.getDate();
};

export const calculateAttendanceCounts = (
  attendanceMap,
  startDay,
  endDay
) => {
  let presentCount = 0;
  let absentCount = 0;

  for (
    let day = startDay;
    day <= endDay;
    day++
  ) {
    if (
      attendanceMap?.[day] ===
      ATTENDANCE_STATUS.PRESENT
    ) {
      presentCount++;
    } else {
      absentCount++;
    }
  }

  return {
    presentCount,
    absentCount
  };
};

export const buildActiveTimeMap = (
  activeTime = []
) => {
  const map = {};

  activeTime.forEach(item => {
    const key = getDateKey(item.date);

    if (!key) {
      return;
    }

    map[key] =
      (item.activeSeconds || 0) * 1000;
  });

  return map;
};

export const findTodayAttendance = (
  records,
  year,
  month,
  today
) => {
  return (
    records.find(record => {
      const date = new Date(
        record.createdAt
      );

      return (
        date.getFullYear() === year &&
        date.getMonth() === month &&
        date.getDate() === today
      );
    }) || null
  );
};
