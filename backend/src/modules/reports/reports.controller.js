import mongoose from "mongoose";

import {
    getDailyAnalytics,
    getWeeklyAnalytics,
    getMonthlyAnalytics,
    getYearlyAnalytics,
    getAvailableReportYears,
    getMonthlyNewUsers,
    getUserMonthlyActivities,
} from "./reports.service.js";

const parseYear = (value) => {
    const year = Number(value);

    if (!Number.isInteger(year) || year < 2000 || year > 2100) {
        return null;
    }

    return year;
};

const parseMonth = (value) => {
    const month = Number(value);

    if (!Number.isInteger(month) || month < 1 || month > 12) {
        return null;
    }

    return month;
};

const sendServerError = (res, error) => {
    console.error("Reports error:", error);

    return res.status(500).json({
        success: false,
        message: "Unable to load reports data",
    });
};

const getDailyReport = async (req, res) => {
    try {
        const date = req.query.date
            ? new Date(`${req.query.date}T00:00:00+05:30`)
            : new Date();

        if (Number.isNaN(date.getTime())) {
            return res.status(400).json({
                success: false,
                message: "Invalid date",
            });
        }

        const data = await getDailyAnalytics(date);

        return res.status(200).json({
            success: true,
            data,
        });
    } catch (error) {
        return sendServerError(res, error);
    }
};

const getWeeklyReport = async (req, res) => {
    try {
        const date = req.query.date
            ? new Date(`${req.query.date}T00:00:00+05:30`)
            : new Date();

        if (Number.isNaN(date.getTime())) {
            return res.status(400).json({
                success: false,
                message: "Invalid date",
            });
        }

        const data = await getWeeklyAnalytics(date);

        return res.status(200).json({
            success: true,
            data,
        });
    } catch (error) {
        return sendServerError(res, error);
    }
};

const getMonthlyReport = async (req, res) => {
    try {
        const currentDate = new Date();

        const year = parseYear(
            req.query.year ?? currentDate.getFullYear()
        );

        const month = parseMonth(
            req.query.month ?? currentDate.getMonth() + 1
        );

        if (!year || !month) {
            return res.status(400).json({
                success: false,
                message: "Invalid year or month",
            });
        }

        const data = await getMonthlyAnalytics(year, month);

        return res.status(200).json({
            success: true,
            data,
        });
    } catch (error) {
        return sendServerError(res, error);
    }
};

const getAvailableYears = async (req, res) => {
    try {
        const years = await getAvailableReportYears();

        return res.status(200).json({
            success: true,
            data: {
                years,
            },
        });
    } catch (error) {
        return sendServerError(res, error);
    }
};

const getYearlyReport = async (req, res) => {
    try {
        const currentYear = new Date().getFullYear();
        const year = parseYear(req.query.year ?? currentYear);

        if (!year) {
            return res.status(400).json({
                success: false,
                message: "Invalid year",
            });
        }

        const data = await getYearlyAnalytics(year);

        return res.status(200).json({
            success: true,
            data,
        });
    } catch (error) {
        return sendServerError(res, error);
    }
};

const getActivityUsers = async (req, res) => {
    try {
        const currentDate = new Date();

        const year = parseYear(
            req.query.year ?? currentDate.getFullYear()
        );

        const month = parseMonth(
            req.query.month ?? currentDate.getMonth() + 1
        );

        if (!year || !month) {
            return res.status(400).json({
                success: false,
                message: "Invalid year or month",
            });
        }

        const users = await getMonthlyNewUsers(year, month);

        return res.status(200).json({
            success: true,
            data: {
                year,
                month,
                users,
            },
        });
    } catch (error) {
        return sendServerError(res, error);
    }
};

const getUserActivity = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user id",
            });
        }

        const currentDate = new Date();

        const year = parseYear(
            req.query.year ?? currentDate.getFullYear()
        );

        const month = parseMonth(
            req.query.month ?? currentDate.getMonth() + 1
        );

        if (!year || !month) {
            return res.status(400).json({
                success: false,
                message: "Invalid year or month",
            });
        }

        const activities = await getUserMonthlyActivities(
            userId,
            year,
            month
        );

        return res.status(200).json({
            success: true,
            data: {
                userId,
                year,
                month,
                activities,
            },
        });
    } catch (error) {
        return sendServerError(res, error);
    }
};

export {
    getDailyReport,
    getWeeklyReport,
    getMonthlyReport,
    getYearlyReport,
    getAvailableYears,
    getActivityUsers,
    getUserActivity,
};