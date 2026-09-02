import { motion } from "framer-motion";

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
                Create your secure certificate payment to receive the
                Razorpay UPI QR code.
            </p>

            <button
                type="button"
                className="pay-confirm-btn"
                onClick={onCreatePayment}
                disabled={creatingPayment}
            >
                {creatingPayment
                    ? "Creating Payment..."
                    : "Pay Certificate Fee"}
            </button>
        </motion.div>
    );
}
