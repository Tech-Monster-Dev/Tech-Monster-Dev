import { motion } from "framer-motion";
import DashButton from "../../../../../../components/ui/Button/DashButton";

export default function CertificatePaymentSection({
    onCreatePayment,
    creatingPayment,
}) {
    return (
        <motion.div
            className="payment-section"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <h4>Step 1: Complete Certificate Fee Payment</h4>

            <p>
                Start your certificate fee payment and scan the UPI QR
                code to complete the payment.
            </p>

            <DashButton
                type="button"
                className="pay-confirm-btn"
                onClick={onCreatePayment}
                loading={creatingPayment}
                loadingText="Creating Payment..."
            >
                Pay Certificate Fee
            </DashButton>
        </motion.div>
    );
}
