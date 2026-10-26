import { useCallback, useEffect, useState } from "react";

import {
    getPendingCertificatePayments,
} from "../../../../services/api/adminCertificatePayment.service";

import EmptyState from "../../../../components/ui/EmptyState/EmptyState";
import useSkeletonScrollLock from "../../../../shared/hooks/useSkeletonScrollLock";
import CertificateUserCardSkeleton from "./CertificateUserCardSkeleton.jsx";

const formatDateTime = (value) => {
    if (!value) return "Not available";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "Not available";
    }

    return new Intl.DateTimeFormat("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
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

const getAvatarUrl = (avatar) => {
    if (!avatar) return null;

    if (
        avatar.startsWith("http://") ||
        avatar.startsWith("https://") ||
        avatar.startsWith("data:")
    ) {
        return avatar;
    }

    return avatar;
};

export default function PendingCertificatePayments({
    refresh = 0,
    onSelectPayment,
}) {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useSkeletonScrollLock(loading);

    const fetchPayments = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const response = await getPendingCertificatePayments();

            setStudents(response?.payments || []);
        } catch (err) {
            console.error(
                "Failed to load certificate payments:",
                err
            );

            setError(
                err?.response?.data?.message ||
                "Unable to load certificate payments."
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const timer = setTimeout(fetchPayments, 0);

        return () => clearTimeout(timer);
    }, [refresh, fetchPayments]);

    if (loading) {
        return (
            <div className="certificate-payments-loading">
                <CertificateUserCardSkeleton />
                <CertificateUserCardSkeleton />
                <CertificateUserCardSkeleton />
            </div>
        );
    }

    if (error) {
        return (
            <div className="certificate-payments-error">
                <h3>Unable to load payments</h3>

                <p>{error}</p>

                <button
                    type="button"
                    onClick={fetchPayments}
                >
                    Try Again
                </button>
            </div>
        );
    }

    if (students.length === 0) {
        return (
            <EmptyState
                heading="No Pending Certificate Payments"
                paragraph="Verified certificate payments waiting for admin approval will appear here."
            />
        );
    }

    return (
        <section className="pending-certificate-payments">
            <div className="certificate-payments-header">
                <div>
                    <h2>Pending Certificate Payments</h2>

                    <p>
                        {students.length} student
                        {students.length !== 1 ? "s" : ""}
                        {" "}awaiting review
                    </p>
                </div>
            </div>

            <div className="certificate-payment-list">
                {students.map((item) => {
                    const student = item.student || {};
                    const payments = item.payments || [];

                    const latestPayment = payments[0];

                    const studentName = getStudentName(student);
                    const avatarUrl = getAvatarUrl(student.avatar);

                    return (
                        <article
                            className="certificate-payment-card"
                            key={student._id}
                            role="button"
                            tabIndex={0}
                            onClick={() =>
                                onSelectPayment?.(
                                    latestPayment?._id
                                )
                            }
                            onKeyDown={(event) => {
                                if (
                                    event.key === "Enter" ||
                                    event.key === " "
                                ) {
                                    event.preventDefault();
                                    onSelectPayment?.(
                                        latestPayment?._id
                                    );
                                }
                            }}
                        >
                            <div className="certificate-payment-card-main">
                                <div className="certificate-payment-avatar">
                                    {avatarUrl ? (
                                        <img
                                            src={avatarUrl}
                                            alt={studentName}
                                        />
                                    ) : (
                                        <span>
                                            {studentName
                                                .charAt(0)
                                                .toUpperCase()}
                                        </span>
                                    )}
                                </div>

                                <div className="certificate-payment-student">
                                    <h3>{studentName}</h3>

                                    <p>
                                        {student.email ||
                                            "No email available"}
                                    </p>

                                    <span className="certificate-payment-requested-at">
                                        Request received:{" "}
                                        {formatDateTime(
                                            latestPayment?.paidAt
                                        )}
                                    </span>
                                </div>

                                <div className="certificate-payment-status">
                                    <span>
                                        Pending
                                    </span>
                                </div>
                            </div>

                            {payments.length > 1 && (
                                <span className="certificate-payment-count">
                                    {payments.length} pending requests
                                </span>
                            )}
                        </article>
                    );
                })}
            </div>
        </section>
    );
}
