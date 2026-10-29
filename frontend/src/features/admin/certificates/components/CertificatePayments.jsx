import { useCallback, useEffect, useMemo, useState } from "react";

import { getIssuedCertificates } from "../../../../services/api/adminCertificatePayment.service";
import Select from "../../../../components/ui/Form/component/Select";
import EmptyState from "../../../../components/ui/EmptyState/EmptyState";

const STORAGE_KEY = "admin-certificate-payments-selected-date";

const getDateKey = (value) => {
    if (!value) return "";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
};

const formatDate = (value) => {
    if (typeof value !== "string") return "Date unavailable";

    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    if (!match) return "Date unavailable";

    const [, yearText, monthText, dayText] = match;
    const year = Number(yearText);
    const month = Number(monthText);
    const day = Number(dayText);
    const date = new Date(year, month - 1, day);

    if (
        !Number.isFinite(date.getTime()) ||
        date.getFullYear() !== year ||
        date.getMonth() !== month - 1 ||
        date.getDate() !== day
    ) {
        return "Date unavailable";
    }

    return new Intl.DateTimeFormat("en-IN", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    }).format(date);
};

const formatTime = (value) => {
    if (!value) return "Time unavailable";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Time unavailable";

    return new Intl.DateTimeFormat("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    }).format(date);
};

const getStudentName = (student = {}) =>
    [
        student.firstName,
        student.middleName,
        student.lastName,
    ]
        .filter(Boolean)
        .join(" ")
        .trim() ||
    student.username ||
    "Student";

const formatCurrency = (amount, currency = "INR") =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: currency || "INR",
        maximumFractionDigits: 2,
    }).format(Number(amount) || 0);

export default function CertificatePayments({ refresh = 0 }) {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedDate, setSelectedDate] = useState(
        () => {
            try {
                return localStorage.getItem(STORAGE_KEY) || "";
            } catch {
                return "";
            }
        }
    );

    const fetchCertificates = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const response = await getIssuedCertificates();
            setStudents(
                Array.isArray(response?.students)
                    ? response.students
                    : []
            );
        } catch (err) {
            console.error("Failed to load certificate payments:", err);
            setError(
                err?.response?.data?.message ||
                "Unable to load certificate payments."
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const timer = setTimeout(fetchCertificates, 0);
        return () => clearTimeout(timer);
    }, [fetchCertificates, refresh]);

    const rows = useMemo(() => {
        return students.flatMap((item) => {
            const student = item.student || {};

            return (item.certificates || []).map((certificate) => ({
                ...certificate,
                student,
                studentName: getStudentName(student),
                dateKey: getDateKey(certificate.issueDate),
            }));
        }).filter((certificate) => certificate.dateKey)
          .sort((a, b) => {
              const dateDifference =
                  new Date(b.issueDate).getTime() -
                  new Date(a.issueDate).getTime();

              return dateDifference ||
                  String(a.id || "").localeCompare(String(b.id || ""));
          });
    }, [students]);

    const dateOptions = useMemo(() => {
        const dates = [...new Set(rows.map((row) => row.dateKey))];

        return dates.map((date) => ({
            value: date,
            label: formatDate(date),
        }));
    }, [rows]);

    const activeDate = dateOptions.some(
        (option) => option.value === selectedDate
    )
        ? selectedDate
        : (dateOptions[0]?.value || "");

    useEffect(() => {
        if (loading || activeDate === selectedDate) return;

        try {
            if (activeDate) {
                localStorage.setItem(STORAGE_KEY, activeDate);
            } else {
                localStorage.removeItem(STORAGE_KEY);
            }
        } catch {
            // The tab still works if browser storage is unavailable.
        }
    }, [loading, activeDate, selectedDate]);

    const handleDateChange = (event) => {
        const value = event?.target?.value || "";
        setSelectedDate(value);

        try {
            if (value) {
                localStorage.setItem(STORAGE_KEY, value);
            } else {
                localStorage.removeItem(STORAGE_KEY);
            }
        } catch {
            // Keep the current selection for this session.
        }
    };

    const selectedRows = useMemo(
        () => rows.filter((row) => row.dateKey === activeDate),
        [rows, activeDate]
    );

    const total = selectedRows.reduce(
        (sum, row) => sum + Math.max(0, Number(row.amount) || 0),
        0
    );

    if (loading) {
        return (
            <section className="certificate-payments-dashboard">
                <div className="certificate-payments-loading-state">
                    <span className="certificate-payments-loading-indicator" />
                    <p>Loading certificate payments...</p>
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section className="certificate-payments-dashboard">
                <div className="certificate-payments-error">
                    <h3>Unable to load certificate payments</h3>
                    <p>{error}</p>
                    <button type="button" onClick={fetchCertificates}>
                        Try Again
                    </button>
                </div>
            </section>
        );
    }

    return (
        <section className="certificate-payments-dashboard">
            <div className="certificate-payments-toolbar">
                <div className="certificate-payments-date-panel">
                    <span className="certificate-payments-eyebrow">
                        PAYMENT OVERVIEW
                    </span>
                    <h2>Issued Certificate Payments</h2>
                    <p>Choose an issue date to view its certificate payments.</p>

                    <Select
                        name="certificate-payment-date"
                        value={activeDate}
                        onChange={handleDateChange}
                        options={dateOptions}
                        placeholder="Select issue date"
                        disabled={dateOptions.length === 0}
                        className="certificate-payments-date-select"
                    />
                </div>

                <article className="certificate-payments-total-card">
                    <span className="certificate-payments-total-icon" aria-hidden="true">
                        ₹
                    </span>
                    <span className="certificate-payments-total-label">
                        TOTAL FOR SELECTED DATE
                    </span>
                    <strong>
                        {formatCurrency(
                            total,
                            selectedRows[0]?.currency || "INR"
                        )}
                    </strong>
                    <span className="certificate-payments-total-count">
                        {selectedRows.length} certificate
                        {selectedRows.length === 1 ? "" : "s"}
                    </span>
                </article>
            </div>

            {selectedRows.length === 0 ? (
                <EmptyState
                    heading="No Certificate Payments"
                    paragraph="No certificates were issued on this date."
                />
            ) : (
                <div className="certificate-payments-table-card">
                    <div className="certificate-payments-table-heading">
                        <div>
                            <h3>Payment Records</h3>
                            <p>{formatDate(selectedDate)}</p>
                        </div>
                        <span className="certificate-payments-record-count">
                            {selectedRows.length} records
                        </span>
                    </div>

                    <div className="certificate-payments-table-scroll">
                        <table className="certificate-payments-table">
                            <thead>
                                <tr>
                                    <th scope="col">Sl. No.</th>
                                    <th scope="col">Student</th>
                                    <th scope="col">Course</th>
                                    <th scope="col">Internship</th>
                                    <th scope="col">Price</th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedRows.map((row, index) => {
                                    const isCourse = row.programType === "course";
                                    const isInternship = row.programType === "internship";

                                    return (
                                        <tr key={row.id || `${row.dateKey}-${index}`}>
                                            <td>
                                                <span className="certificate-payments-serial">
                                                    {index + 1}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="certificate-payments-student">
                                                    <strong>{row.studentName}</strong>
                                                    <span>
                                                        {formatTime(row.issueDate)}
                                                    </span>
                                                </div>
                                            </td>
                                            <td>
                                                {isCourse ? (
                                                    <span
                                                        className="certificate-payments-type-check"
                                                        title={row.programTitle || "Course"}
                                                        aria-label={`Course: ${row.programTitle || "Course"}`}
                                                        tabIndex={0}
                                                    >
                                                        ✓
                                                    </span>
                                                ) : (
                                                    <span className="certificate-payments-empty-cell">—</span>
                                                )}
                                            </td>
                                            <td>
                                                {isInternship ? (
                                                    <span
                                                        className="certificate-payments-type-check internship"
                                                        title={row.programTitle || "Internship"}
                                                        aria-label={`Internship: ${row.programTitle || "Internship"}`}
                                                        tabIndex={0}
                                                    >
                                                        ✓
                                                    </span>
                                                ) : (
                                                    <span className="certificate-payments-empty-cell">—</span>
                                                )}
                                            </td>
                                            <td>
                                                <strong className="certificate-payments-price">
                                                    {formatCurrency(row.amount, row.currency)}
                                                </strong>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colSpan={4}>Total</td>
                                    <td>{formatCurrency(total, selectedRows[0]?.currency || "INR")}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            )}
        </section>
    );
}
