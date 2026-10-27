import "./NoticeDetailed.css";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "react-toastify";
import { FiEdit2, FiTrash2, FiX } from "react-icons/fi";

import DashButton from "../../../../../components/ui/Button/DashButton/DashButton";
import Warning from "../../../../../components/ui/Warning";

import { deleteNotice } from "../../../../../services/api/notice.service";

import useModalScrollLock from "../../../../../shared/hooks/useModalScrollLock";

export default function NoticeDetailed({
    open = false,
    notice = null,
    onClose,
    onEdit,
    onDeleted,
}) {
    const [deleting, setDeleting] = useState(false);
    const deleteInFlightRef = useRef(false);
    const [showDeleteWarning, setShowDeleteWarning] = useState(false);

    useModalScrollLock(open);

    if (!notice) return null;

    const noticeId = notice._id || notice.id;
    const titleId = `notice-detailed-title-${noticeId}`;

    const handleDelete = () => {
        if (!deleting) {
            setShowDeleteWarning(true);
        }
    };

    const handleCancelDelete = () => {
        if (!deleting) {
            setShowDeleteWarning(false);
        }
    };

    const handleConfirmDelete = async () => {
        if (deleteInFlightRef.current || !noticeId) return;

        deleteInFlightRef.current = true;

        try {
            setDeleting(true);
            const response = await deleteNotice(noticeId);

            if (response?.success === false) {
                throw new Error(response?.message || "Failed to delete notice.");
            }

            setShowDeleteWarning(false);
            toast.success("Notice deleted successfully.");
            onDeleted?.(noticeId);
        } catch (error) {
            console.error("Error deleting notice:", error);
            toast.error(
                error?.response?.data?.message ||
                error?.message ||
                "Unable to delete notice."
            );
        } finally {
            deleteInFlightRef.current = false;
            setDeleting(false);
        }
    };

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

                            <div className="notice-detailed-actions">
                                {onEdit && (
                                    <DashButton
                                        variant="secondary"
                                        size="medium"
                                        icon={<FiEdit2 />}
                                        iconPosition="left"
                                        onClick={() => onEdit(notice)}
                                        disabled={deleting}
                                        className="notice-detailed-edit"
                                    >
                                        Edit Notice
                                    </DashButton>
                                )}

                                <DashButton
                                    variant="danger"
                                    size="medium"
                                    icon={<FiTrash2 />}
                                    iconPosition="left"
                                    onClick={handleDelete}
                                    disabled={deleting}
                                    loading={deleting}
                                    loadingText="Deleting..."
                                    className="notice-detailed-delete"
                                >
                                    Delete Notice
                                </DashButton>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}

            <Warning
                open={showDeleteWarning}
                title="Delete Notice?"
                message={`Are you sure you want to delete "${notice.shortTitle || "this notice"}"? This action cannot be undone.`}
                confirmText={deleting ? "Deleting..." : "Confirm"}
                cancelText="Cancel"
                onConfirm={handleConfirmDelete}
                onCancel={handleCancelDelete}
            />
        </AnimatePresence>
    );
}