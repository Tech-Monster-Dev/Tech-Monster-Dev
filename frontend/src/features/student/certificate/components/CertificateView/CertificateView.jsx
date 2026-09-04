import { motion } from "framer-motion";
import CertificatePaymentSection from "./components/CertificatePaymentSection";
import CertificatePaymentModal from "./components/CertificatePaymentModal";
import CertificateApprovalStatus from "./components/CertificateApprovalStatus";
import CertificateRejected from "./components/CertificateRejected";
import CertificateExpired from "./components/CertificateExpired";
import CertificateIssued from "./components/CertificateIssued";
import CertificateSupport from "./components/CertificateSupport";
import useCertificatePayment from "./hooks/useCertificatePayment";

import "./CertificateView.css";

export default function CertificateView({
    courseType,
    userName,
    programId,
    programType,
    onDownload,
}) {
    const {
        payment,
        qrCode,
        loading,
        creatingPayment,
        cancelling,
        isModalOpen,
        timeLeft,
        handleCreatePayment,
        handleCancelPayment,
    } = useCertificatePayment({
        programId,
        programType,
    });

    const status = payment?.status || null;
    const isPaymentPending = ["created", "pending"].includes(status);
    const isApprovalPending = ["paid", "approval_pending"].includes(status);

    if (loading) {
        return (
            <motion.div
                className="certificate-view-container"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="payment-section">
                    <h4>Loading certificate payment...</h4>
                    <p>Checking your certificate payment status.</p>
                </div>
            </motion.div>
        );
    }

    if (!programId) {
        return (
            <motion.div
                className="certificate-view-container"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="approval-section">
                    <h4>Certificate information unavailable</h4>
                    <p>
                        We could not determine the completed program for this certificate.
                    </p>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            className="certificate-view-container"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            {!payment && (
                <CertificatePaymentSection
                    onCreatePayment={handleCreatePayment}
                    creatingPayment={creatingPayment}
                />
            )}

            {isPaymentPending && (
                <CertificatePaymentSection
                    onCreatePayment={handleCreatePayment}
                    creatingPayment={creatingPayment}
                />
            )}

            {isApprovalPending && (
                <CertificateApprovalStatus payment={payment} />
            )}

            {status === "rejected" && (
                <CertificateRejected
                    payment={payment}
                    onCreatePayment={handleCreatePayment}
                    creatingPayment={creatingPayment}
                />
            )}

            {status === "expired" && (
                <CertificateExpired
                    onCreatePayment={handleCreatePayment}
                    creatingPayment={creatingPayment}
                />
            )}

            {status === "approved" && (
                <CertificateIssued
                    userName={userName}
                    courseType={courseType}
                    onDownload={onDownload}
                />
            )}

            <CertificatePaymentModal
                open={isModalOpen}
                qrCode={qrCode}
                amount={payment?.amount}
                currency={payment?.currency || "INR"}
                timeLeft={timeLeft}
                onCancel={handleCancelPayment}
                cancelling={cancelling}
            />

            <CertificateSupport />
        </motion.div>
    );
}
