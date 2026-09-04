import "./Attendance.css";

import {
  useCallback,
  useEffect,
  useState
} from "react";

import useAttendanceData from "./hooks/useAttendanceData";

import AttendanceHeader from "./components/AttendanceHeader";
import CalendarGrid from "./components/CalendarGrid";
import AttendanceLoading from "./components/AttendanceLoading";
import useSkeletonScrollLock from "../../../shared/hooks/useSkeletonScrollLock";

import {
  ACTIVE_TIME_EVENT
} from "./constants/attendance.constants";

export default function AttendancePage() {
  const {
    attendanceRecords,
    dashboard,
    activeTimeData,
    accountCreatedAt,
    enrollments,
    loading,
    setActiveTimeData
  } = useAttendanceData();

  useSkeletonScrollLock(loading);

  const [monthlyCounts, setMonthlyCounts] =
    useState({
      presentCount: 0,
      absentCount: 0
    });

  const handleMonthlyCountsChange =
    useCallback(counts => {
      setMonthlyCounts(counts);
    }, []);

  useEffect(() => {
    const getTodayKey = () => {
      const now = new Date();

      return [
        now.getFullYear(),
        String(now.getMonth() + 1).padStart(2, "0"),
        String(now.getDate()).padStart(2, "0")
      ].join("-");
    };

    const handleLiveActiveTime = event => {
      const milliseconds =
        Number(event.detail?.milliseconds) || 0;

      const key = getTodayKey();

      setActiveTimeData(prev => ({
        ...prev,
        [key]: milliseconds
      }));
    };

    window.addEventListener(
      ACTIVE_TIME_EVENT,
      handleLiveActiveTime
    );

    const timer = window.setInterval(() => {
      const key = getTodayKey();

      setActiveTimeData(prev => {
        const currentMilliseconds =
          Number(prev?.[key]) || 0;

        if (currentMilliseconds <= 0) {
          return prev;
        }

        return {
          ...prev,
          [key]:
            currentMilliseconds + 1000
        };
      });
    }, 1000);

    return () => {
      window.removeEventListener(
        ACTIVE_TIME_EVENT,
        handleLiveActiveTime
      );

      window.clearInterval(timer);
    };
  }, [setActiveTimeData]);

  if (loading) {
    return <AttendanceLoading />;
  }

  return (
    <div className="attendance-page">
      <AttendanceHeader
        user={dashboard?.user}
        presentCount={
          monthlyCounts.presentCount
        }
        absentCount={
          monthlyCounts.absentCount
        }
      />

      <CalendarGrid
        attendanceRecords={attendanceRecords}
        activeTimeData={activeTimeData}
        accountCreatedAt={accountCreatedAt}
        enrollments={enrollments}
        onMonthlyCountsChange={
          handleMonthlyCountsChange
        }
      />
    </div>
  );
}
