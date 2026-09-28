import { motion } from "framer-motion";

export default function CertificateApprovalStatus() {
    return (
        <motion.div
            className="approval-section"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <h4>Step 2: Admin Verification ⏳</h4>

            <p>
                Your payment submission has been received.
                It is now waiting for admin verification and approval.
            </p>

            <p className="certificate-auto-status">
                Approval status is checked automatically.
                You do not need to refresh this page.
            </p>
        </motion.div>
    );
}