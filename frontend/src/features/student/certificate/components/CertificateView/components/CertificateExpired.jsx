import { motion } from "framer-motion";
import DashButton from "../../../../../../components/ui/Button/DashButton";

export default function CertificateExpired({
    onCreatePayment,
    creatingPayment,
}) {
    return (
        <motion.div
            className="approval-section"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <h4>Payment Session Expired</h4>

            <p>
                Your previous certificate payment session has expired.
                Generate a new QR code to continue.
            </p>

            <DashButton
                type="button"
                className="pay-confirm-btn"
                onClick={onCreatePayment}
                loading={creatingPayment}
                loadingText="Generating QR..."
            >
                Regenerate QR
            </DashButton>
        </motion.div>
    );
}
