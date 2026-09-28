import { motion } from "framer-motion";
import DashButton from "../../../../../../components/ui/Button/DashButton";

export default function CertificateRejected({
    payment,
    onCreatePayment,
    creatingPayment,
}) {
    return (
        <motion.div
            className="approval-section certificate-rejected"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <h4>Certificate Payment Rejected</h4>

            <p>
                Your payment was reviewed and rejected by the admin.
            </p>

            {payment?.rejectionReason && (
                <p className="payment-meta">
                    Reason:{" "}
                    <strong>{payment.rejectionReason}</strong>
                </p>
            )}

            <DashButton
                type="button"
                className="pay-confirm-btn"
                onClick={onCreatePayment}
                loading={creatingPayment}
                loadingText="Creating Payment..."
            >
                Create New Payment
            </DashButton>
        </motion.div>
    );
}
