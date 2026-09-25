import "./Certificate.css";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { FiAward, FiDownload, FiCreditCard } from "react-icons/fi";
import { motion } from "framer-motion";

import SectionTabs from "../../../layouts/SectionTabs";
import EmptyState from "../../../components/ui/EmptyState";
import Spinner from "../../../features/dashboard/common/LoaderPage/Spinner";

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

                const loadedCertificates =
                    response?.data?.certificates || [];

                setCertificates(loadedCertificates);

                const notificationProgramId =
                    location.state?.programId;

                if (notificationProgramId) {
                    const matchedCertificate =
                        loadedCertificates.find(
                            (certificate) =>
                                String(certificate.programId) ===
                                String(notificationProgramId)
                        );

                    if (matchedCertificate) {
                        setSelectedCertificate(
                            matchedCertificate
                        );
                        setActiveTab("payment");
                    }
                }
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
    }, [location.state?.programId]);

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
                <Spinner
                    message="Loading your certificates..."
                    size={60}
                />
            </div>
        );
    }

    return (
        <div className="certificate-page-wrapper">

            <SectionTabs
                tabs={[
                    {
                        label: "All Certificates",
                        value: "all",
                        icon: <FiAward />,
                    },
                    {
                        label: "Payment All Certificates",
                        value: "payment",
                        icon: <FiCreditCard />,
                    },
                ]}
                activeTab={activeTab}
                onChange={setActiveTab}
                className="certificate-section-tabs"
            />

            {activeTab === "all" && (
                <motion.section
                    className="all-certificates-section"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    {certificates.length === 0 ? (
                        <EmptyState
                            heading="No completed programs yet"
                            paragraph="Complete a course or internship to see your certificate here."
                        />
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
                        <EmptyState
                            heading="Select a certificate"
                            paragraph="Choose a completed program from All Certificates to continue."
                        />
                    ) : (
                        <>
                            <Congratulations
                                courseType={selectedCertificate.programTitle}
                                userName={userName}
                            />

                            <CertificateView
                                courseType={selectedCertificate.programTitle}
                                userName={userName}
                                programId={selectedCertificate.programId}
                                programType={selectedCertificate.programType}
                                onDownload={(event) => handleDownload(event, selectedCertificate)}
                            />
                        </>
                    )}
                </section>
            )}
        </div>
    );
}
