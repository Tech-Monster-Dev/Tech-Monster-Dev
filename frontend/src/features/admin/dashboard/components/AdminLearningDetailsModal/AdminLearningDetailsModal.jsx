import "./AdminLearningDetailsModal.css";

import { useState } from "react";
import { motion } from "framer-motion";
import {
    FiAward,
    FiBookOpen,
    FiCalendar,
    FiCheckCircle,
    FiClock,
    FiEdit3,
    FiFileText,
    FiTrash2,
    FiX,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import DashButton from "../../../../../components/ui/Button/DashButton";
import Warning from "../../../../../components/ui/Warning";

import { deleteCourse } from "../../../../../services/api/course.service";
import { deleteInternship } from "../../../../../services/api/internship.service";

const formatPrice = (price) => {
    const numericPrice = Number(price);

    if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
        return "Free";
    }

    return `₹${numericPrice}`;
};

const AdminLearningDetailsModal = ({
    open = false,
    item = null,
    type = "course",
    onClose,
    onRefresh,
}) => {
    const navigate = useNavigate();

    const [showDeleteWarning, setShowDeleteWarning] = useState(false);
    const [deleting, setDeleting] = useState(false);

    if (!open || !item) {
        return null;
    }

    const isCourse = type === "course";
    const label = isCourse ? "Course" : "Internship";

    const handleEdit = () => {
        navigate(
            isCourse
                ? "/admin/course-form"
                : "/admin/internships-form",
            {
                state: isCourse
                    ? { courseData: item }
                    : { internshipData: item },
            }
        );
    };

    const handleDelete = () => {
        if (deleting) {
            return;
        }

        setShowDeleteWarning(true);
    };

    const handleCancelDelete = () => {
        if (deleting) {
            return;
        }

        setShowDeleteWarning(false);
    };

    const handleConfirmDelete = async () => {
        if (deleting || !item?._id) {
            return;
        }

        try {
            setDeleting(true);

            if (isCourse) {
                await deleteCourse(item._id);
            } else {
                await deleteInternship(item._id);
            }

            toast.success(
                `${label} deleted successfully`
            );

            setShowDeleteWarning(false);
            onClose?.();
            await onRefresh?.();
        } catch (error) {
            console.error(
                `Failed to delete ${label.toLowerCase()}:`,
                error
            );

            toast.error(
                error.response?.data?.message ||
                `Failed to delete ${label.toLowerCase()}`
            );
        } finally {
            setDeleting(false);
        }
    };

    const handleOverlayClick = (event) => {
        if (event.target === event.currentTarget && !deleting) {
            onClose?.();
        }
    };

    return (
        <>
            <motion.div
                className="adminLearningDetailsOverlay"
                role="dialog"
                aria-modal="true"
                aria-labelledby="admin-learning-details-title"
                onMouseDown={handleOverlayClick}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                <motion.div
                    className="adminLearningDetailsModal"
                    initial={{
                        opacity: 0,
                        y: 24,
                        scale: 0.98,
                    }}
                    animate={{
                        opacity: 1,
                        y: 0,
                        scale: 1,
                    }}
                    exit={{
                        opacity: 0,
                        y: 24,
                        scale: 0.98,
                    }}
                    transition={{ duration: 0.25 }}
                    onMouseDown={(event) => {
                        event.stopPropagation();
                    }}
                >
                    <button
                        type="button"
                        className="adminLearningDetailsClose"
                        onClick={onClose}
                        disabled={deleting}
                        aria-label="Close"
                        title="Close"
                    >
                        <FiX />
                    </button>

                    <div className="adminLearningDetailsContent">
                        <div className="adminLearningDetailsHero">
                            <div className="adminLearningDetailsThumbnail">
                                {item.thumbnail ? (
                                    <img
                                        src={item.thumbnail}
                                        alt={item.title || label}
                                    />
                                ) : (
                                    <FiBookOpen aria-hidden="true" />
                                )}

                                <span>
                                    {label}
                                </span>
                            </div>

                            <div className="adminLearningDetailsIntro">
                                <span className="adminLearningDetailsEyebrow">
                                    {item.category || label}
                                </span>

                                <h2 id="admin-learning-details-title">
                                    {item.title || "Untitled"}
                                </h2>

                                <p>
                                    {item.description ||
                                        "No description available."}
                                </p>
                            </div>
                        </div>

                        <div className="adminLearningDetailsGrid">
                            <div className="adminLearningDetailItem">
                                <FiBookOpen />
                                <div>
                                    <span>Level</span>
                                    <strong>
                                        {item.level || "Not specified"}
                                    </strong>
                                </div>
                            </div>

                            <div className="adminLearningDetailItem">
                                <FiClock />
                                <div>
                                    <span>Duration</span>
                                    <strong>
                                        {item.duration || "Not specified"}
                                    </strong>
                                </div>
                            </div>

                            <div className="adminLearningDetailItem">
                                <FiFileText />
                                <div>
                                    <span>Total Tasks</span>
                                    <strong>
                                        {item.totalTasks ?? 0}
                                    </strong>
                                </div>
                            </div>

                            <div className="adminLearningDetailItem">
                                <FiFileText />
                                <div>
                                    <span>Total Notes</span>
                                    <strong>
                                        {item.totalNotes ?? 0}
                                    </strong>
                                </div>
                            </div>

                            <div className="adminLearningDetailItem">
                                <FiCalendar />
                                <div>
                                    <span>Price</span>
                                    <strong>
                                        {formatPrice(item.price)}
                                    </strong>
                                </div>
                            </div>

                            <div className="adminLearningDetailItem">
                                <FiCheckCircle />
                                <div>
                                    <span>Status</span>
                                    <strong>
                                        {item.isPublished
                                            ? "Published"
                                            : "Unpublished"}
                                    </strong>
                                </div>
                            </div>

                            <div className="adminLearningDetailItem">
                                <FiAward />
                                <div>
                                    <span>Certificate</span>
                                    <strong>
                                        {item.certificate
                                            ? "Available"
                                            : "Not available"}
                                    </strong>
                                </div>
                            </div>

                            <div className="adminLearningDetailItem">
                                <FiAward />
                                <div>
                                    <span>Badge</span>
                                    <strong>
                                        {item.badge
                                            ? "Available"
                                            : "Not available"}
                                    </strong>
                                </div>
                            </div>
                        </div>
                    </div>

                    <footer className="adminLearningDetailsFooter">
                        <DashButton
                            variant="secondary"
                            size="medium"
                            icon={<FiEdit3 />}
                            iconPosition="left"
                            onClick={handleEdit}
                            disabled={deleting}
                        >
                            Edit {label}
                        </DashButton>

                        <DashButton
                            variant="danger"
                            size="medium"
                            icon={<FiTrash2 />}
                            iconPosition="left"
                            onClick={handleDelete}
                            disabled={deleting}
                            loading={deleting}
                            loadingText="Deleting..."
                        >
                            Delete
                        </DashButton>
                    </footer>
                </motion.div>
            </motion.div>

            <Warning
                open={showDeleteWarning}
                title={`Delete ${label}?`}
                message={`Are you sure you want to delete "${item.title || "this program"}"? This action cannot be undone.`}
                confirmText={
                    deleting
                        ? "Deleting..."
                        : `Delete ${label}`
                }
                cancelText="Cancel"
                onCancel={handleCancelDelete}
                onConfirm={handleConfirmDelete}
            />
        </>
    );
};

export default AdminLearningDetailsModal;
