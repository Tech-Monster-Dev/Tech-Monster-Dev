import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { FiAward, FiDownload, FiCreditCard } from "react-icons/fi";
import { motion } from "framer-motion";

import "./Certificate.css";

import CertificateView from "./components/CertificateView";
import Congratulations from "./components/Congratulations";
import { getMyCertificates, downloadCertificate } from "../../../services/api/certificate.service";
import useAttendanceData from "../attendance/hooks/useAttendanceData";

export default function Certificate() {
    const location = useLocation();

    const [certificates, setCertificates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("all");
    const [selectedCertificate, setSelectedCertificate] = useState(null);
    const [downloadingId, setDownloadingId] = useState(null);

    const { dashboard } = useAttendanceData();
    const rawUserName = dashboard?.user?.username || location.state?.userName || "Username";

    const userName = rawUserName.charAt(0).toUpperCase() + rawUserName.slice(1);

    useEffect(() => {
        const loadCertificates = async () => {
            try {
                setLoading(true);

                const response = await getMyCertificates();

                setCertificates(response?.data?.certificates || []);
            } catch (error) {
                toast.error(
                    error?.response?.data?.message ||
                    "Unable to load your certificates."
                );
            } finally {
                setLoading(false);
            }
        };

        loadCertificates();
    }, []);

    useEffect(() => {
        const stateProgramId = location.state?.programId;

        if (!stateProgramId || certificates.length === 0) {
            return;
        }

        const matched = certificates.find(
            (item) => String(item.programId) === String(stateProgramId)
        );

        if (matched) {
            setSelectedCertificate(matched);
            setActiveTab("payment");
        }
    }, [certificates, location.state]);

    const handleProgramClick = (certificate) => {
        setSelectedCertificate(certificate);
        setActiveTab("payment");
    };

    const handleDownload = async (event, certificate) => {
        event.stopPropagation();

        if (!certificate.unlocked || !certificate.certificate?.id) {
            return;
        }

        try {
            setDownloadingId(certificate.certificate.id);

            const response = await downloadCertificate(
                certificate.certificate.id
            );

            const blob = new Blob([response.data], {
                type: "application/pdf",
            });

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");

            link.href = url;
            link.download =
                `Certificate-${certificate.programTitle}.pdf`;

            document.body.appendChild(link);
            link.click();
            link.remove();

            window.URL.revokeObjectURL(url);

            toast.success("Certificate downloaded successfully.");
        } catch (error) {
            toast.error(
                error?.response?.data?.message ||
                "Unable to download certificate."
            );
        } finally {
            setDownloadingId(null);
        }
    };

    if (loading) {
        return (
            <div className="certificate-page-wrapper">
                <div className="certificate-loading">
                    Loading your certificates...
                </div>
            </div>
        );
    }

    return (
        <div className="certificate-page-wrapper">

            <div className="certificate-tabs">
                <button
                    type="button"
                    className={activeTab === "all" ? "active" : ""}
                    onClick={() => setActiveTab("all")}
                >
                    <FiAward />
                    All Certificates
                </button>

                <button
                    type="button"
                    className={activeTab === "payment" ? "active" : ""}
                    onClick={() => setActiveTab("payment")}
                >
                    <FiCreditCard />
                    Payment All Certificates
                </button>
            </div>

            {activeTab === "all" && (
                <motion.section
                    className="all-certificates-section"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="certificate-section-heading">
                        <h2>All Certificates</h2>
                        <p>
                            Your completed courses and internships.
                        </p>
                    </div>

                    {certificates.length === 0 ? (
                        <div className="certificate-empty-state">
                            <FiAward />
                            <h3>No completed programs yet</h3>
                            <p>
                                Complete a course or internship to see
                                your certificate here.
                            </p>
                        </div>
                    ) : (
                        <div className="certificate-list">
                            {certificates.map((certificate) => (
                                <motion.div
                                    key={`${certificate.programType}-${certificate.programId}`}
                                    className="certificate-program-row"
                                    whileHover={{ y: -2 }}
                                    onClick={() =>
                                        handleProgramClick(certificate)
                                    }
                                >
                                    <div className="certificate-program-info">
                                        <span className="certificate-program-badge">
                                            {certificate.programType === "course"
                                                ? "Course"
                                                : "Internship"}
                                        </span>

                                        <div>
                                            <h3>
                                                {certificate.programTitle}
                                            </h3>

                                            <p>
                                                Certificate Fee:{" "}
                                                <strong>
                                                    ₹
                                                    {certificate.fee || 0}
                                                </strong>
                                            </p>
                                        </div>
                                    </div>

                                    {certificate.unlocked && (
                                        <button
                                            type="button"
                                            className="certificate-download-icon"
                                            title="Download Certificate"
                                            disabled={
                                                downloadingId ===
                                                certificate.certificate?.id
                                            }
                                            onClick={(event) =>
                                                handleDownload(
                                                    event,
                                                    certificate
                                                )
                                            }
                                        >
                                            <FiDownload />
                                        </button>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    )}
                </motion.section>
            )}

            {activeTab === "payment" && (
                <section className="certificate-payment-detail">
                    {!selectedCertificate ? (
                        <div className="certificate-empty-state">
                            <FiCreditCard />
                            <h3>Select a certificate</h3>
                            <p>
                                Choose a completed program from All
                                Certificates to continue.
                            </p>
                        </div>
                    ) : (
                        <>
                            <Congratulations
                                courseType={
                                    selectedCertificate.programTitle
                                }
                                userName={userName}
                            />

                            <CertificateView
                                courseType={
                                    selectedCertificate.programTitle
                                }
                                userName={userName}
                                programId={
                                    selectedCertificate.programId
                                }
                                programType={
                                    selectedCertificate.programType
                                }
                                onDownload={(event) =>
                                    handleDownload(event, selectedCertificate)
                                }
                            />
                        </>
                    )}
                </section>
            )}
        </div>
    );
}
