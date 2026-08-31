import { AnimatePresence, motion } from "framer-motion";
import { Clock3, BookOpen, ListChecks, X } from "lucide-react";

import defaultThumbnail from "../../../../../assets/thumnail/course_internship_default.svg";

import "./LearningPreviewModal.css";

const LearningPreviewModal = ({
    open = false,
    item = null,
    type = "course",
    onCancel,
    onEnroll,
}) => {
    const isCourse = type === "course";
    const label = isCourse ? "Course" : "Internship";

    if (!item) return null;

    const title = item.title || label;

    const description =
        item.description ||
        `Explore this ${label.toLowerCase()} and learn more about what it offers.`;

    const thumbnail =
        item.thumbnail || defaultThumbnail;

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    className="learning-preview-overlay"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="learning-preview-title"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            onCancel?.();
                        }
                    }}
                >
                    <motion.div
                        className="learning-preview-modal"
                        initial={{
                            opacity: 0,
                            y: 35,
                            scale: 0.96,
                        }}
                        animate={{
                            opacity: 1,
                            y: 0,
                            scale: 1,
                        }}
                        exit={{
                            opacity: 0,
                            y: 25,
                            scale: 0.96,
                        }}
                        transition={{
                            duration: 0.25,
                            ease: "easeOut",
                        }}
                    >
                        <button
                            type="button"
                            className="learning-preview-close"
                            aria-label="Close"
                            onClick={onCancel}
                        >
                            <X size={20} />
                        </button>

                        <div className="learning-preview-thumbnail">
                            <img
                                src={thumbnail}
                                alt={title}
                                onError={(event) => {
                                    event.currentTarget.onerror = null;
                                    event.currentTarget.src =
                                        defaultThumbnail;
                                }}
                            />

                            <span className="learning-preview-type">
                                {label}
                            </span>
                        </div>

                        <div className="learning-preview-content">
                            <span className="learning-preview-eyebrow">
                                {item.category || label}
                            </span>

                            <h2 id="learning-preview-title">
                                {title}
                            </h2>

                            <p className="learning-preview-description">
                                {description}
                            </p>

                            <div className="learning-preview-meta">
                                {item.level && (
                                    <div className="learning-preview-meta-item">
                                        <BookOpen size={17} />
                                        <span>
                                            {item.level}
                                        </span>
                                    </div>
                                )}

                                {item.duration && (
                                    <div className="learning-preview-meta-item">
                                        <Clock3 size={17} />
                                        <span>
                                            {item.duration}
                                        </span>
                                    </div>
                                )}

                                {item.totalTasks !== undefined && (
                                    <div className="learning-preview-meta-item">
                                        <ListChecks size={17} />
                                        <span>
                                            {item.totalTasks} Tasks
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="learning-preview-actions">
                                <button
                                    type="button"
                                    className="learning-preview-cancel"
                                    onClick={onCancel}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="button"
                                    className="learning-preview-enroll"
                                    onClick={onEnroll}
                                >
                                    Enroll Now
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default LearningPreviewModal;
