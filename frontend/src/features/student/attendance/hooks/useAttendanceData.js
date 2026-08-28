import {
  useCallback,
  useEffect,
  useState
} from "react";

import {
  getMyAttendance
} from "../../../../services/api/attendance.service";

import api from "../../../../services/api/axios";
import { API } from "../../../../services/api/endpoints";

import {
  buildActiveTimeMap
} from "../utils/attendance.utils";

export default function useAttendanceData() {
  const [attendanceRecords, setAttendanceRecords] =
    useState([]);

  const [dashboard, setDashboard] =
    useState(null);

  const [activeTimeData, setActiveTimeData] =
    useState({});

  const [accountCreatedAt, setAccountCreatedAt] =
    useState(null);

  const [enrollments, setEnrollments] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const loadAttendance =
    useCallback(async () => {
      try {
        const response =
          await getMyAttendance();

        setAttendanceRecords(
          response.attendance || []
        );

        setAccountCreatedAt(
          response.accountCreatedAt || null
        );

        setEnrollments(
          response.enrollments || []
        );
      } catch (error) {
        console.log(error);
      }
    }, []);

  const loadDashboard =
    useCallback(async () => {
      try {
        const { data } =
          await api.get(
            API.DASHBOARD.STUDENT
          );

        setDashboard(
          data.dashboard
        );

        setActiveTimeData(
          buildActiveTimeMap(
            data.dashboard?.activeTime || []
          )
        );
      } catch (error) {
        console.log(error);
      }
    }, []);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        await Promise.all([
          loadAttendance(),
          loadDashboard()
        ]);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    queueMicrotask(load);

    return () => {
      mounted = false;
    };
  }, [
    loadAttendance,
    loadDashboard
  ]);

  return {
    attendanceRecords,
    dashboard,
    activeTimeData,
    accountCreatedAt,
    enrollments,
    loading,
    setActiveTimeData
  };
}
