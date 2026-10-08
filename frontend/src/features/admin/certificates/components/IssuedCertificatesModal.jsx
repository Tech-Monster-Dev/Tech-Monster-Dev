import { useState } from "react";

import {
    downloadIssuedCertificate,
} from "../../../../services/api/adminCertificatePayment.service";

import IssuedCertificateDetails from "./IssuedCertificateDetails.jsx";

const ISSUED_CERTIFICATE_DETAILS_STORAGE_KEY = 'admin-certificate-issued-details-modal';

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

const formatAmount = (amount, currency = "INR") => {
    if (amount === null || amount === undefined) {
        return "Not available";
    }

    try {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency,
        }).format(amount);
    } catch {
        return `${currency} ${amount}`;
    }
};

export default function IssuedCertificatesModal({
    studentData,
    onClose,
}) {
    const [selectedCertificate, setSelectedCertificate] =
        useState(() => {
            const storedCertificate = sessionStorage.getItem(
                ISSUED_CERTIFICATE_DETAILS_STORAGE_KEY
            );

            if (!storedCertificate) {
                return null;
            }

            try {
                return JSON.parse(storedCertificate);
            } catch {
                sessionStorage.removeItem(
                    ISSUED_CERTIFICATE_DETAILS_STORAGE_KEY
                );
                return null;
            }
        });

    const [downloadingId, setDownloadingId] = useState(null);

    if (!studentData) {
        return null;
    }

    const student = studentData.student || {};
    const certificates = studentData.certificates || [];
    const studentName = getStudentName(student);

    const handleDownload = async (event, certificate) => {
        event.stopPropagation();

        if (!certificate?.id || downloadingId) {
            return;
        }

        setDownloadingId(certificate.id);

        try {
            const response = await downloadIssuedCertificate(
                certificate.id
            );

            const blob = new Blob(
                [response.data],
                {
                    type:
                        response?.headers?.["content-type"] ||
                        "application/pdf",
                }
            );

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");

            link.href = url;
            link.download =
                `Certificate-${certificate.certificateNumber || certificate.id}.pdf`;

            document.body.appendChild(link);
            link.click();
            link.remove();

            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error(
                "Failed to download certificate:",
                error
            );
        } finally {
            setDownloadingId(null);
        }
    };

    if (selectedCertificate) {
        return (
            <IssuedCertificateDetails
                student={student}
                certificate={selectedCertificate}
                onClose={() => {
                    sessionStorage.removeItem(
                        ISSUED_CERTIFICATE_DETAILS_STORAGE_KEY
                    );
                    setSelectedCertificate(null);
                }}
            />
        );
    }

    return (
        <div
            className="issued-certificates-modal-overlay"
            role="dialog"
            aria-modal="true"
            aria-labelledby="issued-certificates-modal-title"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                    sessionStorage.removeItem(
                        ISSUED_CERTIFICATE_DETAILS_STORAGE_KEY
                    );
                    onClose?.();
                }
            }}
        >
            <div className="issued-certificates-modal">
                <header className="issued-certificates-modal-header">
                    <div>
                        <span className="issued-certificates-modal-eyebrow">
                            Issued Certificates
                        </span>

                        <h2 id="issued-certificates-modal-title">
                            {studentName}
                        </h2>

                        <p>
                            {certificates.length} certificate
                            {certificates.length !== 1
                                ? "s"
                                : ""}{" "}
                            issued
                        </p>
                    </div>

                    <button
                        type="button"
                        className="issued-certificates-modal-close"
                        onClick={onClose}
                        aria-label="Close issued certificates"
                    >
                        ×
                    </button>
                </header>

                <div className="issued-certificates-modal-content">
                    {certificates.map((certificate) => (
                        <article
                            className="issued-certificate-card"
                            key={certificate.id}
                            role="button"
                            tabIndex={0}
                            onClick={() => {
                                sessionStorage.setItem(
                                    ISSUED_CERTIFICATE_DETAILS_STORAGE_KEY,
                                    JSON.stringify(certificate)
                                );
                                setSelectedCertificate(certificate);
                            }}
                            onKeyDown={(event) => {
                                if (
                                    event.key === "Enter" ||
                                    event.key === " "
                                ) {
                                    event.preventDefault();

                                    sessionStorage.setItem(
                                        ISSUED_CERTIFICATE_DETAILS_STORAGE_KEY,
                                        JSON.stringify(certificate)
                                    );
                                    setSelectedCertificate(certificate);
                                }
                            }}
                        >
                            <div className="issued-certificate-card-content">
                                <div className="issued-certificate-card-info">
                                    <span className="issued-certificate-type">
                                        {certificate.programType ===
                                        "internship"
                                            ? "Internship"
                                            : "Course"}
                                    </span>

                                    <h3>
                                        {certificate.programTitle ||
                                            "Certificate"}
                                    </h3>

                                    <div className="issued-certificate-meta">
                                        <span>
                                            Price paid:{" "}
                                            {formatAmount(
                                                certificate.amount,
                                                certificate.currency
                                            )}
                                        </span>

                                        <span>
                                            Issued:{" "}
                                            {formatDateTime(
                                                certificate.issueDate
                                            )}
                                        </span>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    className="issued-certificate-download"
                                    onClick={(event) =>
                                        handleDownload(
                                            event,
                                            certificate
                                        )
                                    }
                                    disabled={
                                        downloadingId ===
                                        certificate.id
                                    }
                                >
                                    {downloadingId ===
                                    certificate.id
                                        ? "Downloading..."
                                        : "Download"}
                                </button>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </div>
    );
}
