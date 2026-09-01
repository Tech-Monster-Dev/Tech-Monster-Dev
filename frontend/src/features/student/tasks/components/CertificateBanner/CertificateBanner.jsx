import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { FiLock, FiArrowRight, FiAward } from "react-icons/fi";

import "./CertificateBanner.css";

export default function CertificateBanner({
    completedCount = 0,
    totalCount = 0,
    allCompleted = false,
    programId = null,
    programType = "internship",
}) {
    const navigate = useNavigate();

    const handleClaim = () => {
        navigate(
            "/student/certificate",
            {
                state: {
                    programId,
                    programType,
                },
            }
        );
    };

    const locked = !allCompleted;

    return (
        <motion.div
            className="certificate-banner"
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
        >
            <div className="certificate-banner-icon">
                {locked ? <FiLock /> : <FiAward />}
            </div>

            {locked ? (
                <div className="certificate-banner-info">
                    <h4>Internship Certificate</h4>
                    <p>
                        Complete all tasks to unlock Certificate (
                        {completedCount}/{totalCount} completed)
                    </p>
                </div>
            ) : (
                <div className="certificate-banner-info">
                    <h4>You're all set! 🎉</h4>
                    <p>All tasks approved. Claim your internship certificate now.</p>
                </div>
            )}

            <motion.button
                className={`certificate-banner-btn ${locked ? "locked" : "unlocked"}`}
                whileTap={locked ? undefined : { scale: 0.96 }}
                disabled={locked}
                onClick={locked ? undefined : handleClaim}
            >
                {locked ? (
                    <>
                        <FiLock /> Complete all tasks to unlock
                    </>
                ) : (
                    <>
                        Claim Certificate <FiArrowRight />
                    </>
                )}
            </motion.button>
        </motion.div>
    );
}
