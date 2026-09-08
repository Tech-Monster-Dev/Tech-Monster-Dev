import { AnimatePresence, motion } from "framer-motion";
import { FiEdit2, FiX } from "react-icons/fi";

import useModalScrollLock from "../../../../../shared/hooks/useModalScrollLock";

import "./NoticeDetailed.css";

export default function NoticeDetailed({
    open = false,
    notice = null,
    onClose,
    onEdit,
}) {
    useModalScrollLock(open);

    if (!notice) return null;

    const noticeId = notice._id || notice.id;
    const titleId = `notice-detailed-title-${noticeId}`;

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    className="notice-detailed-overlay"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby={titleId}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            onClose?.();
                        }
                    }}
                >
                    <motion.div
                        className="notice-detailed-modal"
                        initial={{ opacity: 0, y: 35, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 25, scale: 0.96 }}
                        transition={{ duration: 0.25, ease: "easeOut" }}
                    >
                        <button
                            type="button"
                            className="notice-detailed-close"
                            aria-label="Close notice details"
                            onClick={onClose}
                        >
                            <FiX size={20} />
                        </button>

                        {notice.image && (
                            <div className="notice-detailed-image-wrap">
                                <img
                                    src={notice.image}
                                    alt={notice.subject || notice.shortTitle}
                                    className="notice-detailed-image"
                                    onError={(event) => {
                                        event.currentTarget.style.display = "none";
                                    }}
                                />
                            </div>
                        )}

                        <div className="notice-detailed-content">
                            <span className="notice-detailed-eyebrow">
                                NOTICE
                            </span>

                            <h2 id={titleId}>{notice.shortTitle}</h2>

                            <h3>{notice.subject}</h3>

                            <p className="notice-detailed-description">
                                {notice.description}
                            </p>

                            <time
                                className="notice-detailed-date"
                                dateTime={notice.createdAt || undefined}
                            >
                                {notice.createdAt
                                    ? new Date(notice.createdAt).toLocaleString("en-IN")
                                    : "—"}
                            </time>

                            {onEdit && (
                                <div className="notice-detailed-actions">
                                    <button
                                        type="button"
                                        className="notice-detailed-edit"
                                        onClick={() => onEdit(notice)}
                                    >
                                        <FiEdit2 />
                                        Edit Notice
                                    </button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
