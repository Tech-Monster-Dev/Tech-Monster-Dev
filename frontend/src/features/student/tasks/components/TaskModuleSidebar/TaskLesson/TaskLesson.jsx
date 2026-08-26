import { motion, AnimatePresence } from "framer-motion";

import {
    ChevronDown,
    ChevronRight,
    BookOpenCheck,
} from "lucide-react";

import TaskItem from "./TaskItem";

import "./TaskLesson.css";


export default function TaskLesson({
    lesson,
    isOpen,
    onToggleLesson,
    activeTaskId,
    taskStatusMap,
    deadlineMap,
    now,
    lockedIds,
    onSelectTask,
}) {

    const tasks = lesson.tasks || [];


    return (

        <div className="task-lesson">

            {/* ================================= */}
            {/* LESSON HEADER */}
            {/* ================================= */}

            <motion.div
                whileTap={{scale: 0.98}}
                className="task-lesson-header"
                onClick={() => onToggleLesson(lesson.id)}
            >

                <div className="task-lesson-title">
                    <BookOpenCheck size={15} />
                    <div>
                        <h5>
                            {lesson.title}
                        </h5>
                        <span>
                            {tasks.length} Tasks
                        </span>
                    </div>
                </div>

                {isOpen ? (
                    <ChevronDown size={16} />
                ) : (
                    <ChevronRight size={16} />
                )}

            </motion.div>


            {/* ================================= */}
            {/* TASK LIST */}
            {/* ================================= */}

            <AnimatePresence initial={false}>
                {isOpen && (
                    <motion.div
                        className="task-lesson-items"
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
                            duration: 0.25,
                        }}
                    >

                        {tasks.length === 0 && (
                            <div className="task-no-items">
                                No tasks available.
                            </div>
                        )}


                        {tasks.map((task) => (
                            <TaskItem
                                key={task.id}
                                task={task}
                                active={activeTaskId === task.id}
                                taskStatusMap={taskStatusMap}
                                deadlineMap={deadlineMap}
                                now={now}
                                lockedIds={lockedIds}
                                onSelectTask={onSelectTask}
                            />

                        ))}

                    </motion.div>

                )}

            </AnimatePresence>

        </div>
    );
}