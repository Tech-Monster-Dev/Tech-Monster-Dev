import "./Reports.css";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
    FiActivity,
    FiBarChart2,
    FiCalendar,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";

import SectionTabs from "../../../layouts/SectionTabs";
import Select from "../../../components/ui/Form/component/Select";
import EmptyState from "../../../components/ui/EmptyState";

import {
    getActivityUsers,
    getDailyReport,
    getMonthlyReport,
    getWeeklyReport,
    getAvailableReportYears,
    getYearlyReport,
} from "../../../services/api/reports.service";

import ActivityUserCard from "./components/ActivityUserCard";
import ReportUserCard from "./components/ReportUserCard";
import ReportsChart from "./components/ReportsChart";
import ReportsSkeleton from "./components/ReportsSkeleton";


const REPORT_TABS = [
    {
        value: "daily",
        label: "Daily Analytics",
        icon: <FiCalendar />,
    },
    {
        value: "weekly",
        label: "Weekly Analytics",
        icon: <FiBarChart2 />,
    },
    {
        value: "monthly",
        label: "Monthly Analytics",
        icon: <FiBarChart2 />,
    },
    {
        value: "yearly",
        label: "Yearly Analytics",
        icon: <FiBarChart2 />,
    },
    {
        value: "activity",
        label: "Activity",
        icon: <FiActivity />,
    },
];

const MONTHS = Array.from({ length: 12 }, (_, index) => ({
    value: index + 1,
    label: new Intl.DateTimeFormat("en-IN", {
        month: "long",
    }).format(new Date(2000, index, 1)),
}));

const getCurrentDateParts = () => {
    const now = new Date();

    return {
        date: new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(now),
        year: now.getFullYear(),
        month: now.getMonth() + 1,
    };
};

const formatDate = (date, options = {}) => {
    if (!date) return "";

    return new Intl.DateTimeFormat("en-IN", {
        dateStyle: "medium",
        ...options,
    }).format(new Date(`${date}T00:00:00+05:30`));
};

const formatMonth = (year, month) =>
    new Intl.DateTimeFormat("en-IN", {
        month: "long",
        year: "numeric",
    }).format(new Date(year, month - 1, 1));

const getMonthName = (month) =>
    MONTHS.find((item) => item.value === month)?.label || "";

const Reports = () => {
    const navigate = useNavigate();

    const current = useMemo(() => getCurrentDateParts(), []);

    const [activeTab, setActiveTab] = useState(() => sessionStorage.getItem("admin-reports-active-tab") || "daily");

    const [selectedYear, setSelectedYear] = useState(() => Number(sessionStorage.getItem("admin-reports-selected-year")) || current.year);
    const [availableYears, setAvailableYears] = useState([current.year]);
    const [selectedMonth, setSelectedMonth] = useState(() => Number(sessionStorage.getItem("admin-reports-selected-month")) || current.month);

    const [dailyData, setDailyData] = useState(null);
    const [weeklyData, setWeeklyData] = useState(null);
    const [monthlyData, setMonthlyData] = useState(null);
    const [yearlyData, setYearlyData] = useState(null);
    const [activityUsers, setActivityUsers] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadReport = useCallback(async (silent = false) => {
        if (!silent) setLoading(true);
        setError("");

        try {
            if (activeTab === "daily") {
                const response = await getDailyReport(current.date);

                setDailyData(response?.data || null);
            }

            if (activeTab === "weekly") {
                const response = await getWeeklyReport(current.date);

                setWeeklyData(response?.data || null);
            }

            if (activeTab === "monthly") {
                const response = await getMonthlyReport(
                    selectedYear,
                    selectedMonth
                );

                setMonthlyData(response?.data || null);
            }

            if (activeTab === "yearly") {
                const response = await getYearlyReport(selectedYear);

                setYearlyData(response?.data || null);
            }

            if (activeTab === "activity") {
                const response = await getActivityUsers(
                    selectedYear,
                    selectedMonth
                );

                setActivityUsers(response?.data?.users || []);
            }
        } catch (requestError) {
            console.error("Unable to load report:", requestError);

            setError(
                requestError?.response?.data?.message ||
                "Unable to load report data."
            );
        } finally {
            setLoading(false);
        }
    }, [
        activeTab,
        current.date,
        selectedMonth,
        selectedYear,
    ]);

    useEffect(() => {
        let cancelled = false;

        const loadAvailableYears = async () => {
            try {
                const response = await getAvailableReportYears();
                const years = Array.isArray(response?.data?.years)
                    ? response.data.years
                    : [];

                if (cancelled || !years.length) return;

                setAvailableYears(years);

                if (!years.includes(selectedYear)) {
                    setSelectedYear(years[years.length - 1]);
                }
            } catch (requestError) {
                console.error("Unable to load report years:", requestError);
            }
        };

        loadAvailableYears();

        return () => {
            cancelled = true;
        };
    }, [selectedYear]);

    useEffect(() => {
        sessionStorage.setItem("admin-reports-active-tab", activeTab);
    }, [activeTab]);

    useEffect(() => {
        sessionStorage.setItem("admin-reports-selected-year", String(selectedYear));
    }, [selectedYear]);

    useEffect(() => {
        sessionStorage.setItem("admin-reports-selected-month", String(selectedMonth));
    }, [selectedMonth]);

    useEffect(() => {
        let cancelled = false;

        const fetchReport = async () => {
            if (cancelled) return;

            await loadReport();
        };

        fetchReport();

        return () => {
            cancelled = true;
        };
    }, [loadReport]);

    useEffect(() => {
        if (activeTab !== "activity") return undefined;

        const interval = window.setInterval(() => {
            loadReport(true);
        }, 10000);

        return () => window.clearInterval(interval);
    }, [activeTab, loadReport]);

    const dailyChart = useMemo(() => {
        if (!dailyData) return [];

        return [
            {
                date: "Present",
                present: dailyData.totalPresent || 0,
            },
            {
                date: "Absent",
                present: dailyData.totalAbsent || 0,
            },
            {
                date: "Total",
                present: dailyData.totalStudents || 0,
            },
        ];
    }, [dailyData]);

    const weeklyChart = useMemo(
        () =>
            (weeklyData?.days || []).map((day) => ({
                ...day,
                date: new Intl.DateTimeFormat("en-IN", {
                    weekday: "short",
                }).format(
                    new Date(`${day.date}T00:00:00+05:30`)
                ),
            })),
        [weeklyData]
    );

    const monthlyChart = useMemo(
        () =>
            (monthlyData?.chart || []).map((item) => ({
                ...item,
                date: new Intl.DateTimeFormat("en-IN", {
                    day: "2-digit",
                }).format(
                    new Date(`${item.date}T00:00:00+05:30`)
                ),
            })),
        [monthlyData]
    );

    const yearlyChart = useMemo(
        () =>
            (yearlyData?.chart || []).map((item) => ({
                ...item,
                month: getMonthName(
                    Number(item.month?.split("-")[1])
                ).slice(0, 3),
            })),
        [yearlyData]
    );

    const handleActivityUserClick = (user) => {
        if (!user?._id) return;

        navigate(
            `/admin/reports/activity/${user._id}?year=${selectedYear}&month=${selectedMonth}`
        );
    };

    const renderSelector = () => {
        if (
            activeTab !== "monthly" &&
            activeTab !== "activity" &&
            activeTab !== "yearly"
        ) {
            return null;
        }

        return (
            <div className="reports-filters">
                {activeTab !== "activity" && (
                    <Select
                        name="report-year"
                        value={selectedYear}
                        onChange={(event) =>
                            setSelectedYear(Number(event.target.value))
                        }
                        options={availableYears.map((year) => ({
                            value: year,
                            label: String(year),
                        }))}
                        className="reports-filter-select"
                    />
                )}

                {(activeTab === "monthly" ||
                    activeTab === "activity") && (
                        <Select
                            name="report-month"
                            value={selectedMonth}
                            onChange={(event) =>
                                setSelectedMonth(Number(event.target.value))
                            }
                            options={MONTHS.map((month) => ({
                                value: month.value,
                                label: month.label,
                            }))}
                            className="reports-filter-select"
                        />
                    )}
            </div>
        );
    };

    const renderDaily = () => (
        <>
            <section className="reports-section">
                <div className="reports-section-heading">
                    <div>
                        <span className="reports-section-eyebrow">
                            Daily attendance
                        </span>

                        <h2>
                            {formatDate(dailyData?.date)}
                        </h2>
                    </div>

                    <strong className="reports-stat">
                        {dailyData?.totalPresent || 0}
                        <span>Present</span>
                    </strong>
                </div>

                <ReportsChart
                    data={dailyChart}
                    valueKey="present"
                    labelKey="date"
                    emptyMessage="No attendance recorded today."
                />
            </section>

            <section className="reports-section">
                <div className="reports-section-heading">
                    <div>
                        <span className="reports-section-eyebrow">
                            Present users
                        </span>

                        <h2>Today&apos;s attendance</h2>
                    </div>
                </div>

                {dailyData?.users?.length ? (
                    <div className="report-user-grid">
                        {dailyData.users.map((user) => (
                            <ReportUserCard
                                key={user._id}
                                user={user}
                            />
                        ))}
                    </div>
                ) : (
                    <EmptyState
                        heading="No attendance recorded"
                        paragraph="No users were marked present today."
                        compact
                    />
                )}
            </section>
        </>
    );

    const renderWeekly = () => (
        <>
            <section className="reports-section">
                <div className="reports-section-heading">
                    <div>
                        <span className="reports-section-eyebrow">
                            Weekly attendance
                        </span>

                        <h2>
                            {formatDate(
                                weeklyData?.startDate
                            )}{" "}
                            —{" "}
                            {formatDate(
                                weeklyData?.endDate
                            )}
                        </h2>
                    </div>
                </div>

                <ReportsChart
                    data={weeklyChart}
                    valueKey="present"
                    labelKey="date"
                    emptyMessage="No weekly attendance data available."
                />
            </section>

            <section className="reports-section">
                <div className="reports-section-heading">
                    <div>
                        <span className="reports-section-eyebrow">
                            Full-week attendance
                        </span>

                        <h2>Present every day</h2>

                        <p>
                            Users recorded as present on every
                            day from Monday through Sunday.
                        </p>
                    </div>

                    <strong className="reports-stat">
                        {weeklyData?.users?.length || 0}
                        <span>Users</span>
                    </strong>
                </div>

                {weeklyData?.users?.length ? (
                    <div className="report-user-grid">
                        {weeklyData.users.map((user) => (
                            <ReportUserCard
                                key={user._id}
                                user={user}
                            />
                        ))}
                    </div>
                ) : (
                    <EmptyState
                        heading="No qualifying users"
                        paragraph="No user was present on all seven days of the current week."
                        compact
                    />
                )}
            </section>
        </>
    );

    const renderMonthly = () => (
        <>
            <section className="reports-section">
                <div className="reports-section-heading">
                    <div>
                        <span className="reports-section-eyebrow">
                            Monthly attendance
                        </span>

                        <h2>
                            {formatMonth(
                                selectedYear,
                                selectedMonth
                            )}
                        </h2>
                    </div>

                    <strong className="reports-stat">
                        {monthlyData?.totalPresentUsers || 0}
                        <span>Users</span>
                    </strong>
                </div>

                <ReportsChart
                    data={monthlyChart}
                    valueKey="present"
                    labelKey="date"
                    emptyMessage="No monthly attendance data available."
                />
            </section>

            <section className="reports-section">
                <div className="reports-section-heading">
                    <div>
                        <span className="reports-section-eyebrow">
                            Attendance threshold
                        </span>

                        <h2>20+ days present</h2>

                        <p>
                            Users who were recorded as present on
                            at least 20 distinct days in the
                            selected month.
                        </p>
                    </div>

                    <strong className="reports-stat">
                        {monthlyData?.qualifyingUsers?.length ||
                            0}
                        <span>Users</span>
                    </strong>
                </div>

                {monthlyData?.qualifyingUsers?.length ? (
                    <div className="report-user-grid">
                        {monthlyData.qualifyingUsers.map(
                            (user) => (
                                <ReportUserCard
                                    key={user._id}
                                    user={user}
                                    meta={`${user.presentDays} days present`}
                                />
                            )
                        )}
                    </div>
                ) : (
                    <EmptyState
                        heading="No qualifying users"
                        paragraph="No users reached the 20-day attendance threshold for this month."
                        compact
                    />
                )}
            </section>
        </>
    );

    const renderYearly = () => (
        <section className="reports-section">
            <div className="reports-section-heading">
                <div>
                    <span className="reports-section-eyebrow">
                        Yearly attendance
                    </span>

                    <h2>{selectedYear} overview</h2>

                    <p>
                        Distinct users recorded as present in
                        each month of the selected year.
                    </p>
                </div>
            </div>

            <ReportsChart
                data={yearlyChart}
                valueKey="present"
                labelKey="month"
                emptyMessage="No yearly attendance data available."
            />
        </section>
    );

    const renderActivity = () => (
        <section className="reports-section">
            <div className="reports-section-heading">
                <div>
                    <span className="reports-section-eyebrow">
                        Account activity
                    </span>

                    <h2>
                        Active students —{" "}
                        {formatMonth(
                            selectedYear,
                            selectedMonth
                        )}
                    </h2>

                    <p>
                        Students with genuine activity during the selected month. Select a student to view all of their activity records.
                    </p>
                </div>

                <strong className="reports-stat">
                    {activityUsers.length}
                    <span>Active students</span>
                </strong>
            </div>

            {activityUsers.length ? (
                <div className="activity-user-grid">
                    {activityUsers.map((user) => (
                        <ActivityUserCard
                            key={user._id}
                            user={user}
                            onClick={handleActivityUserClick}
                        />
                    ))}
                </div>
            ) : (
                <EmptyState
                    heading="No student activity"
                    paragraph="No student activity was recorded during this month."
                    compact
                />
            )}
        </section>
    );

    const renderContent = () => {
        if (activeTab === "daily") return renderDaily();
        if (activeTab === "weekly") return renderWeekly();
        if (activeTab === "monthly") return renderMonthly();
        if (activeTab === "yearly") return renderYearly();

        return renderActivity();
    };

    return (
        <main className="reports-page">
            <header className="reports-header">
                <div className="reports-heading">
                    <span className="reports-eyebrow">
                        Administration
                    </span>

                    <h1>Reports &amp; Analytics</h1>

                    <p>
                        Monitor attendance and user activity
                        through genuine platform data.
                    </p>
                </div>

                {renderSelector()}
            </header>

            <SectionTabs
                tabs={REPORT_TABS}
                activeTab={activeTab}
                onChange={setActiveTab}
                className="reports-tabs"
            />

            <section className="reports-content">
                {loading && (
                    <ReportsSkeleton
                        chart={activeTab !== "activity"}
                        users={activeTab !== "yearly"}
                        userCount={6}
                    />
                )}

                {!loading && error && (
                    <div className="reports-state reports-error">
                        <span className="reports-state-eyebrow">
                            Something went wrong
                        </span>

                        <h2>Unable to load report</h2>

                        <p>{error}</p>

                        <button
                            type="button"
                            className="reports-secondary-button"
                            onClick={loadReport}
                        >
                            Try again
                        </button>
                    </div>
                )}

                {!loading && !error && (
                    <div className="reports-tab-content">
                        {renderContent()}
                    </div>
                )}
            </section>
        </main>
    );
};

export default Reports;