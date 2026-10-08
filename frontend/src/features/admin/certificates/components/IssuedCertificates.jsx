import { useCallback, useEffect, useState } from "react";

import {getIssuedCertificates} from "../../../../services/api/adminCertificatePayment.service";

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

    return avatar;
};

export default function IssuedCertificates({
    refresh = 0,
    onSelectStudent,
}) {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useSkeletonScrollLock(loading);

    const fetchCertificates = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const response = await getIssuedCertificates();

            setStudents(response?.students || []);
        } catch (err) {
            console.error(
                "Failed to load issued certificates:",
                err
            );

            setError(
                err?.response?.data?.message ||
                "Unable to load issued certificates."
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const timer = setTimeout(fetchCertificates, 0);

        return () => clearTimeout(timer);
    }, [refresh, fetchCertificates]);

    if (loading) {
        return (
            <div className="certificate-issued-loading">
                <CertificateUserCardSkeleton />
                <CertificateUserCardSkeleton />
                <CertificateUserCardSkeleton />
            </div>
        );
    }

    if (error) {
        return (
            <div className="certificate-issued-error">
                <h3>Unable to load issued certificates</h3>

                <p>{error}</p>

                <button
                    type="button"
                    onClick={fetchCertificates}
                >
                    Try Again
                </button>
            </div>
        );
    }

    if (students.length === 0) {
        return (
            <EmptyState
                heading="No Issued Certificates"
                paragraph="Students who have received certificates will appear here."
            />
        );
    }

    return (
        <section className="issued-certificates">
            <div className="certificate-issued-header">
                <div>
                    <h2>Issued Certificates</h2>

                    <p>
                        {students.length} student
                        {students.length !== 1 ? "s" : ""}
                        {" "}with issued certificates
                    </p>
                </div>
            </div>

            <div className="certificate-issued-list">
                {students.map((item) => {
                    const student = item.student || {};
                    const certificates = item.certificates || [];
                    const latestCertificate = certificates[0];

                    const studentName = getStudentName(student);
                    const avatarUrl = getAvatarUrl(student.avatar);

                    return (
                        <article
                            className="certificate-issued-card"
                            key={student._id}
                            role="button"
                            tabIndex={0}
                            onClick={() =>
                                onSelectStudent?.(item)
                            }
                            onKeyDown={(event) => {
                                if (
                                    event.key === "Enter" ||
                                    event.key === " "
                                ) {
                                    event.preventDefault();
                                    onSelectStudent?.(item);
                                }
                            }}
                        >
                            <div className="certificate-issued-card-main">
                                <div className="certificate-issued-avatar">
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

                                <div className="certificate-issued-student">
                                    <h3>{studentName}</h3>

                                    <p>
                                        {student.email ||
                                            "No email available"}
                                    </p>

                                    <span className="certificate-issued-at">
                                        Issued:{" "}
                                        {formatDateTime(
                                            latestCertificate?.issueDate
                                        )}
                                    </span>
                                </div>

                                <div className="certificate-issued-status">
                                    <span>Issued</span>
                                </div>
                            </div>

                            {certificates.length > 1 && (
                                <span className="certificate-issued-count">
                                    {certificates.length} certificates
                                </span>
                            )}
                        </article>
                    );
                })}
            </div>
        </section>
    );
}