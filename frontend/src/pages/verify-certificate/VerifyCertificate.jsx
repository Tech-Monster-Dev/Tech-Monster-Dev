import "./VerifyCertificate.css";

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { verifyCertificate } from "../../services/api/certificate.service";

export default function VerifyCertificate() {
    const { token } = useParams();

    const [certificate, setCertificate] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let active = true;

        const loadCertificate = async () => {
            setLoading(true);
            setError("");

            try {
                const response = await verifyCertificate(token);

                if (active) {
                    setCertificate(response?.data?.certificate || response?.certificate || null);
                }
            } catch (err) {
                if (active) {
                    setError(
                        err?.response?.data?.message ||
                        "Unable to verify this certificate."
                    );
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        };

        if (token) {
            loadCertificate();
        } else {
            queueMicrotask(() => {
                setError("Certificate verification token is missing.");
                setLoading(false);
            });
        }

        return () => {
            active = false;
        };
    }, [token]);

    const formatDate = (value) => {
        if (!value) return "—";

        return new Date(value).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "long",
            year: "numeric",
        });
    };

    return (
        <main className="verify-certificate-page">
            <section className="verify-certificate-card">
                {loading && (
                    <div className="verify-certificate-state">
                        <p className="verify-certificate-eyebrow">
                            CERTIFICATE VERIFICATION
                        </p>
                        <h1>Verifying Certificate...</h1>
                        <p>
                            Please wait while we verify the certificate
                            details.
                        </p>
                    </div>
                )}

                {!loading && error && (
                    <div className="verify-certificate-state verify-certificate-error">
                        <p className="verify-certificate-eyebrow">
                            CERTIFICATE VERIFICATION
                        </p>
                        <h1>Certificate Not Verified</h1>
                        <p>{error}</p>
                    </div>
                )}

                {!loading && !error && certificate && (
                    <>
                        <div className="verify-certificate-header">
                            <p className="verify-certificate-eyebrow">
                                TECH MONSTER
                            </p>
                            <h1>Certificate Verified</h1>
                            <p>
                                This certificate has been successfully
                                verified from the Tech Monster certificate
                                records.
                            </p>
                        </div>

                        <div className="verify-certificate-details">
                            <div className="verify-certificate-detail">
                                <span>Student Name</span>
                                <strong>{certificate.studentName}</strong>
                            </div>

                            <div className="verify-certificate-detail">
                                <span>Certificate Type</span>
                                <strong>
                                    {certificate.programType === "course"
                                        ? "Course"
                                        : "Internship"}
                                </strong>
                            </div>

                            <div className="verify-certificate-detail">
                                <span>Program</span>
                                <strong>{certificate.programTitle}</strong>
                            </div>

                            <div className="verify-certificate-detail">
                                <span>Duration</span>
                                <strong>{certificate.duration}</strong>
                            </div>

                            <div className="verify-certificate-detail">
                                <span>Completion Date</span>
                                <strong>
                                    {formatDate(certificate.completionDate)}
                                </strong>
                            </div>

                            <div className="verify-certificate-detail">
                                <span>Certificate ID</span>
                                <strong>{certificate.certificateNumber}</strong>
                            </div>

                            <div className="verify-certificate-detail">
                                <span>Issue Date</span>
                                <strong>
                                    {formatDate(certificate.issueDate)}
                                </strong>
                            </div>
                        </div>
                    </>
                )}
            </section>
        </main>
    );
}
