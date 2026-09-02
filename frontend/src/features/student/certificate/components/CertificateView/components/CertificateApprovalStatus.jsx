import { motion } from "framer-motion";

export default function CertificateApprovalStatus({ payment }) {
    return (
        <motion.div
            className="approval-section"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <h4>Step 2: Admin Verification ⏳</h4>

            <p>
                Your payment has been successfully verified.
                It is now waiting for admin approval.
            </p>

            {payment?.transactionId && (
                <p className="payment-meta">
                    Transaction ID:{" "}
                    <strong>{payment.transactionId}</strong>
                </p>
            )}

            <p className="certificate-auto-status">
                Approval status is checked automatically.
                You do not need to refresh this page.
            </p>
        </motion.div>
    );
}
