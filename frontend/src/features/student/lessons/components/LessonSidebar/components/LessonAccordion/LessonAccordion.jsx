import "./LessonAccordion.css";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    ChevronDown,
    ChevronRight,
    CheckCircle2,
    Circle,
    BookOpen,
} from "lucide-react";
import { FiLock, FiCheckSquare } from "react-icons/fi";
import { toast } from "react-toastify";


export default function LessonAccordion({
    lesson,
    module,
    moduleId,
    activeLesson,
    open,
    onToggle,
    setActiveLesson,
    courseSlug,
    contentType,
    approvedModuleIds = new Set(),
    canStart = true,
    moduleNumber = 1,
}) {
    const navigate = useNavigate();

    // All lessons in this module must be completed before the task unlocks.
    const hasTasks = Array.isArray(lesson?.tasks) && lesson.tasks.length > 0;
    const isModuleCompleted = (module || []).length > 0 && (module || []).every((item) => item.completed);

    // Whether this module's task submission has been APPROVED by an admin.

    const handleLessonClick = (lessonItem) => {
        if (!canStart) {
            toast.warning(`Complete and get approval for Module ${moduleNumber - 1} before starting Module ${moduleNumber}.`);
            return;
        }

        if (lessonItem.locked) {
            // Blocked because the PREVIOUS module's task is not yet approved.
            toast.warning(`Please submit and get Admin approval for Module ${moduleNumber - 1} Task before starting Module ${moduleNumber}!`);
            return;
        }
        setActiveLesson(lessonItem.id);
    };

    const handleModuleTaskClick = () => {
        navigate(
            `/student/tasks/${contentType}/${courseSlug}`,
            {
                state: {
                    courseSlug: courseSlug || null,
                    moduleId: moduleId || null,
                    isModuleCompleted,
                },
            }
        );
    }

    return (
        <div className="lesson-module">
            {/* Module Header */}
            <motion.div
                className="module-header"
                onClick={() => {
                    if (!canStart) {
                        toast.warning(
                            `Complete and get approval for Module ${moduleNumber - 1} before starting Module ${moduleNumber}.`
                        );
                        return;
                    }

                    onToggle(!open);
                }}
            >
                <div className="module-title">
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
                        className="module-lessons"
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
                                whileHover={{ x: 6 }}
                                className={`accordion-lesson ${activeLesson === lessonItem.id ? "active" : ""} ${lessonItem.locked ? "locked" : ""}`}
                                onClick={() => handleLessonClick(lessonItem)}
                            >
                                <div className="lesson-icon">
                                    {lessonItem.completed ? (
                                        <CheckCircle2 size={18} className="completed" />

                                    ) : lessonItem.locked ? (

                                        <FiLock size={18} className="locked" />
                                    ) : (

                                        <Circle size={18} className="pending" />
                                    )}
                                </div>

                                <div className="lesson-text">
                                    <h4>{lessonItem.heading}</h4>
                                </div>
                            </motion.div>
                        ))}

                        {/* Module Task Bar */}

                        {hasTasks && isModuleCompleted && (
                            <motion.div
                                whileHover={{ x: 6 }}
                                className="accordion-task task-unlocked"
                                onClick={() => handleModuleTaskClick()}
                            >
                                <div className="task-icon">
                                    {approvedModuleIds.has(String(moduleId)) ? (
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

                                <div className="task-text">
                                    <h4>
                                        Module {moduleNumber} Tasks
                                    </h4>

                                    <small>
                                        {approvedModuleIds.has(String(moduleId)) ? "All tasks approved" : "Ready to attempt"}
                                    </small>
                                </div>

                                <span className="task-badge">
                                    {approvedModuleIds.has(String(moduleId)) ? "Approved" : "READY"}
                                </span>
                            </motion.div>
                        )}
                    </motion.div>
                )}

            </AnimatePresence>
        </div>
    );
}