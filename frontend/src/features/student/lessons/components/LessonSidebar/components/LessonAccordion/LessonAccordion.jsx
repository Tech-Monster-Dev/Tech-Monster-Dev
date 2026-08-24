import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    ChevronDown,
    ChevronRight,
    CheckCircle2,
    Circle,
    BookOpen,
} from "lucide-react";
import { FiLock, FiCheck, FiCheckSquare } from "react-icons/fi";
import { toast } from "react-toastify";

import "./LessonAccordion.css";

export default function LessonAccordion({
    lesson,
    module,
    moduleId,
    activeLesson,
    setActiveLesson,
    courseSlug,
    contentType,
    approvedModuleIds = new Set(),
    canStart = true,
    moduleNumber = 1,
}) {
    const [open, setOpen] = useState(canStart);
    const navigate = useNavigate();

    // All lessons in this module must be completed before the task unlocks.
    const isModuleCompleted = (module || []).length > 0 &&
        (module || []).every((item) => item.completed);

    // Whether this module's task submission has been APPROVED by an admin.
    const isModuleTaskApproved = approvedModuleIds.has(lesson?.id);

    const handleLessonClick = (lessonItem) => {
        if (!canStart) {
            toast.warning(
                `Complete and get approval for Module ${moduleNumber - 1} before starting Module ${moduleNumber}.`
            );
            return;
        }

        if (lessonItem.locked) {
            // Blocked because the PREVIOUS module's task is not yet approved.
            toast.warning(
                `Please submit and get Admin approval for Module ${moduleNumber - 1} Task before starting Module ${moduleNumber}!`
            );
            return;
        }

        setActiveLesson(lessonItem.id);
    };

    const handleTaskClick = (lessonItem) => {
        if (!canStart) {
            toast.warning(
                `Complete and get approval for Module ${moduleNumber - 1} before starting Module ${moduleNumber}.`
            );
            return;
        }

        if (!lessonItem?.completed) {
            toast.warning(
                "Complete this lesson before attempting its task!"
            );
            return;
        }

        navigate(
            `/student/tasks/${contentType}/${courseSlug}`,
            {
                state: {
                    courseSlug: courseSlug || null,
                    moduleId: moduleId || lesson?.id || null,
                    lessonId: lessonItem.id || null,
                },
            }
        );
    };

    return (
        <div id="lesson-module">
            {/* Module Header */}

            <motion.div
                whileTap={{ scale: 0.98 }}
                id="module-header"
                onClick={() => {
                    if (!canStart) {
                        toast.warning(
                            `Complete and get approval for Module ${moduleNumber - 1} before starting Module ${moduleNumber}.`
                        );
                        return;
                    }

                    setOpen(!open);
                }}
            >
                <div id="module-title">
                    {canStart ? (
                        <BookOpen size={18} />
                    ) : (
                        <FiLock size={18} className="locked" />
                    )}

                    <div>
                        <h3>{lesson.title}</h3>

                        <span>
                            {lesson.length || 0} Lessons
                        </span>
                    </div>
                </div>

                {canStart && (
                    open ? (
                        <ChevronDown size={20} />
                    ) : (
                        <ChevronRight size={20} />
                    )
                )}
            </motion.div>

            {/* Lessons */}

            <AnimatePresence>

                {open && (
                    <motion.div
                        id="module-lessons"
                        initial={{
                            height: 0,
                            opacity: 0,
                        }}
                        animate={{
                            height: "auto",
                            opacity: 1,
                        }}
                        exit={{
                            height: 0,
                            opacity: 0,
                        }}
                        transition={{
                            duration: 0.35,
                        }}
                    >
                        {(module || []).map((lessonItem) => (
                            <motion.div
                                key={lessonItem.id}
                                whileHover={{
                                    x: 6,
                                }}
                                whileTap={{
                                    scale: 0.98,
                                }}
                                className={`accordion-lesson ${activeLesson === lessonItem.id
                                    ? "active"
                                    : ""
                                    } ${lessonItem.locked ? "locked" : ""}`}
                                onClick={() =>
                                    handleLessonClick(lessonItem)
                                }
                            >
                                <div className="lesson-icon">
                                    {lessonItem.completed ? (
                                        <CheckCircle2
                                            size={18}
                                            className="completed"
                                        />
                                    ) : lessonItem.locked ? (
                                        <FiLock
                                            size={18}
                                            className="locked"
                                        />
                                    ) : (
                                        <Circle
                                            size={18}
                                            className="pending"
                                        />
                                    )}
                                </div>

                                <div id="lesson-text">
                                    <h4>{lessonItem.heading}</h4>
                                </div>
                            </motion.div>
                        ))}

                        {/* Module Task Bar */}

        {isModuleCompleted && (
            <motion.div
                whileHover={{ x: 6 }}
                whileTap={{ scale: 0.98 }}
                className="accordion-task task-unlocked"
                onClick={() => {
                    navigate(
                        `/student/tasks/${contentType}/${courseSlug}`,
                        {
                            state: {
                                courseSlug: courseSlug || null,
                                moduleId: moduleId || null,
                            },
                        }
                    );
                }}
            >
                <div className="task-icon">
                    {approvedModuleIds.has(moduleId) ? (
                        <FiCheckSquare
                            size={18}
                            className="task-ready"
                        />
                    ) : (
                        <FiCheckSquare
                            size={18}
                            className="task-ready"
                        />
                    )}
                </div>

                <div id="task-text">
                    <h4>
                        Module {moduleNumber} Tasks
                    </h4>

                    <small>
                        {approvedModuleIds.has(moduleId)
                            ? "All tasks approved"
                            : "Ready to attempt"}
                    </small>
                </div>

                <span className="task-badge">
                    {approvedModuleIds.has(moduleId)
                        ? "Approved"
                        : "READY"}
                </span>
            </motion.div>
        )}
                    </motion.div>
                )}

            </AnimatePresence>
        </div>
    );
}
