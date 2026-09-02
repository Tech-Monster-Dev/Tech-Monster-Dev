import { motion } from "framer-motion";

export default function CertificateIssued({
    userName,
    courseType,
    onDownload,
}) {
    return (
        <motion.div
            className="certificate-download-section"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <div className="certificate-template-preview">
                <p className="cert-title">
                    Certificate of Completion
                </p>

                <p>This is proudly presented to</p>

                <h2 className="cert-name">
                    {userName}
                </h2>

                <p>
                    for successfully completing the rigorous
                    curriculum in{" "}
                    <strong>{courseType}</strong>.
                </p>
            </div>

            <button
                type="button"
                className="download-btn"
                onClick={onDownload}
            >
                Download Certificate (PDF)
            </button>
        </motion.div>
    );
}
