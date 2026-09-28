import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { IndianRupee } from "lucide-react";
import PaymentQRCode from "./PaymentQRCode";
import DashButton from "../../../../../../components/ui/Button/DashButton";

export default function CertificatePaymentModal({
    open,
    qrCode,
    amount,
    timeLeft,
    onCancel,
    onSubmit,
    cancelling,
    submitting,
}) {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    if (!open) return null;

    return createPortal(
        <AnimatePresence>
            <motion.div
                className="certificate-payment-modal-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                <motion.div
                    className="certificate-payment-modal"
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                >
                    <div className="certificate-payment-modal-header">
                        <h3>Pay Certificate Fee</h3>
                        <button type="button" className="certificate-modal-close" onClick={onCancel} disabled={cancelling} aria-label="Close payment">×</button>
                    </div>

                    <p className="certificate-payment-instruction">
                        Scan this QR code using any supported UPI app to complete your certificate payment.
                    </p>

                    {qrCode?.imageUrl && (
                        <PaymentQRCode imageUrl={qrCode.imageUrl} />
                    )}

                    <div className="certificate-payment-total">
                        <IndianRupee size={28} strokeWidth={2.5} aria-hidden="true" />
                        <span>
                            {Number(amount || 0).toLocaleString("en-IN", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            })}
                        </span>
                    </div>

                    <div className="certificate-payment-timer">
                        Payment session expires in <strong>{String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}</strong>
                    </div>

                    <p className="certificate-payment-auto-status">
                        After completing the UPI payment, click "I Have Paid".
                        Your payment will then be sent for admin verification.
                    </p>

                    <div className="certificate-payment-actions">
                        <DashButton
                            type="button"
                            className="pay-confirm-btn"
                            onClick={onSubmit}
                            disabled={cancelling}
                            loading={submitting}
                            loadingText="Submitting..."
                            fullWidth
                        >
                            I Have Paid
                        </DashButton>

                        <DashButton
                            type="button"
                            variant="secondary"
                            className="certificate-payment-cancel"
                            onClick={onCancel}
                            disabled={submitting}
                            loading={cancelling}
                            loadingText="Cancelling..."
                            fullWidth
                        >
                            Cancel Payment
                        </DashButton>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>,
        document.body
    );
}