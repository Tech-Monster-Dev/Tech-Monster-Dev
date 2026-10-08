import api from "./axios";

export const getDailyReport = async (date) => {
    const { data } = await api.get("/admin/reports/daily", {
        params: date ? { date } : undefined,
    });

    return data;
};

export const getWeeklyReport = async (date) => {
    const { data } = await api.get("/admin/reports/weekly", {
        params: date ? { date } : undefined,
    });

    return data;
};

export const getMonthlyReport = async (year, month) => {
    const { data } = await api.get("/admin/reports/monthly", {
        params: {
            year,
            month,
        },
    });

    return data;
};

export const getAvailableReportYears = async () => {
    const { data } = await api.get("/admin/reports/years");

    return data;
};

export const getYearlyReport = async (year) => {
    const { data } = await api.get("/admin/reports/yearly", {
        params: {
            year,
        },
    });

    return data;
};

export const getActivityUsers = async (year, month) => {
    const { data } = await api.get("/admin/reports/activity/users", {
        params: {
            year,
            month,
        },
    });

    return data;
};

export const getUserActivity = async (userId, year, month) => {
    const { data } = await api.get(
        `/admin/reports/activity/users/${userId}`,
        {
            params: {
                year,
                month,
            },
        }
    );

    return data;
};