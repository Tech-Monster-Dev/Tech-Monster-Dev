
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

export default function IssuedCertificateDetails({
    student,
    certificate,
    onClose,
}) {
    if (!certificate) {
        return null;
    }

    const studentName = getStudentName(student);

    const programType =
        certificate.programType === "internship"
            ? "Internship"
            : "Course";

    return (
        <div
            className="issued-certificate-details-overlay"
            role="dialog"
            aria-modal="true"
            aria-labelledby="issued-certificate-details-title"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                    onClose?.();
                }
            }}
        >
            <div className="issued-certificate-details-modal">
                <header className="issued-certificate-details-header">
                    <div>
                        <span className="issued-certificate-details-eyebrow">
                            Certificate Details
                        </span>

                        <h2 id="issued-certificate-details-title">
                            {certificate.programTitle ||
                                "Certificate"}
                        </h2>
                    </div>

                    <button
                        type="button"
                        className="issued-certificate-details-close"
                        onClick={onClose}
                        aria-label="Close certificate details"
                    >
                        ×
                    </button>
                </header>

                <div className="issued-certificate-details-content">
                    <section className="issued-certificate-details-section">
                        <h3>Student</h3>

                        <div className="issued-certificate-details-grid">
                            <div className="issued-certificate-detail-item">
                                <span>Name</span>

                                <strong>
                                    {studentName}
                                </strong>
                            </div>

                            <div className="issued-certificate-detail-item">
                                <span>Email</span>

                                <strong>
                                    {student?.email ||
                                        "Not available"}
                                </strong>
                            </div>
                        </div>
                    </section>

                    <section className="issued-certificate-details-section">
                        <h3>Program</h3>

                        <div className="issued-certificate-details-grid">
                            <div className="issued-certificate-detail-item">
                                <span>Type</span>

                                <strong>
                                    {programType}
                                </strong>
                            </div>

                            <div className="issued-certificate-detail-item">
                                <span>Program</span>

                                <strong>
                                    {certificate.programTitle ||
                                        "Not available"}
                                </strong>
                            </div>

                            <div className="issued-certificate-detail-item">
                                <span>Duration</span>

                                <strong>
                                    {certificate.duration ||
                                        "Not available"}
                                </strong>
                            </div>
                        </div>
                    </section>

                    <section className="issued-certificate-details-section">
                        <h3>Payment</h3>

                        <div className="issued-certificate-details-grid">
                            <div className="issued-certificate-detail-item">
                                <span>Price paid</span>

                                <strong>
                                    {formatAmount(
                                        certificate.amount,
                                        certificate.currency
                                    )}
                                </strong>
                            </div>

                            <div className="issued-certificate-detail-item">
                                <span>Payer name</span>

                                <strong>
                                    {certificate.payerName ||
                                        "Not available"}
                                </strong>
                            </div>

                            <div className="issued-certificate-detail-item">
                                <span>Transaction ID</span>

                                <strong>
                                    {certificate.transactionId ||
                                        "Not available"}
                                </strong>
                            </div>

                            <div className="issued-certificate-detail-item">
                                <span>Paid at</span>

                                <strong>
                                    {formatDateTime(
                                        certificate.paidAt
                                    )}
                                </strong>
                            </div>
                        </div>
                    </section>

                    {certificate.verificationToken && (
                        <section className="issued-certificate-details-section">
                            <h3>Certificate Verification</h3>

                            <div className="issued-certificate-details-grid">
                                <div className="issued-certificate-detail-item">
                                    <span>Verification URL</span>

                                    <strong>
                                        https://tech-monster-dev-lac.vercel.app/verify-certificate/{certificate.verificationToken}
                                    </strong>
                                </div>
                            </div>
                        </section>
                    )}

                    <section className="issued-certificate-details-section">
                        <h3>Certificate</h3>

                        <div className="issued-certificate-details-grid">
                            <div className="issued-certificate-detail-item">
                                <span>
                                    Certificate number
                                </span>

                                <strong>
                                    {certificate.certificateNumber ||
                                        "Not available"}
                                </strong>
                            </div>

                            <div className="issued-certificate-detail-item">
                                <span>Completed at</span>

                                <strong>
                                    {formatDateTime(
                                        certificate.completionDate
                                    )}
                                </strong>
                            </div>

                            <div className="issued-certificate-detail-item">
                                <span>Issued at</span>

                                <strong>
                                    {formatDateTime(
                                        certificate.issueDate
                                    )}
                                </strong>
                            </div>
                        </div>
                    </section>
                </div>

                <footer className="issued-certificate-details-footer">
                    <span>Issued</span>
                </footer>
            </div>
        </div>
    );
}
