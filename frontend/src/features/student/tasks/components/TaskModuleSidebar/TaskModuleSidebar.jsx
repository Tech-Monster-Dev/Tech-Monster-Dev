import {
    useMemo,
    useState,
} from "react";
import { motion } from "framer-motion";
import {
    CheckCircle2,
} from "lucide-react";

import {
    FiClock,
    FiLock,
} from "react-icons/fi";

import TaskLesson from "./TaskLesson";

import "./TaskModuleSidebar.css";


export default function TaskModuleSidebar({
    modules = [],
    activeTaskId,
    taskStatusMap = {},
    deadlineMap = {},
    now = 0,
    lockedIds = [],
    onSelectTask,
    contentType = "Task",
}) {
    const moduleList = useMemo(() => {
        if (Array.isArray(modules)) {
            return modules;
        }

        return modules
            ? [modules]
            : [];
    }, [modules]);

    const lessonList = useMemo(() => {
        return moduleList.flatMap(
            (module) => module.lessons || []
        );
    }, [moduleList]);


    // =========================================
    // OPEN LESSONS
    // =========================================

    const [openLessons, setOpenLessons] =
        useState(
            () => new Set()
        );

    const activeLessonId = useMemo(() => {
        const activeLesson = lessonList.find(
            (lesson) =>
                (lesson.tasks || []).some(
                    (task) =>
                        task.id === activeTaskId
                )
        );

        return activeLesson?.id || null;
    }, [
        activeTaskId,
        lessonList,
    ]);


    // =========================================
    // TOGGLE LESSON
    // =========================================

    const toggleLesson = (lessonId) => {

        setOpenLessons((prev) => {

            const next = new Set(prev);

            if (next.has(lessonId)) {
                next.delete(lessonId);
            } else {
                next.add(lessonId);
            }

            return next;
        });
    };


    // =========================================
    // SELECT TASK
    // =========================================

    const handleTaskClick = (task) => {

        if (lockedIds.includes(task.id)) {
            return;
        }

        onSelectTask?.(task.id);
    };


    return (

        <motion.aside
            className="task-module-sidebar"
            initial={{
                x: -30,
                opacity: 0,
            }}
            animate={{
                x: 0,
                opacity: 1,
            }}
            transition={{
                duration: 0.45,
            }}
        >

            {/* ================================= */}
            {/* HEADER */}
            {/* ================================= */}

            <div className="task-sidebar-header">
                <span className="task-sidebar-icon">
                    <FiClock />
                </span>

                <div>
                    <h3>
                        {contentType.toUpperCase()} Tasks
                    </h3>
                    <p>
                        Complete in order to unlock
                    </p>
                </div>
            </div>

            {/* ================================= */}
            {/* LESSON LIST */}
            {/* ================================= */}

            <div className="task-sidebar-list">
                {lessonList.length === 0 && (
                    <div className="task-sidebar-empty">
                        No tasks yet.
                    </div>
                )}


                {lessonList.map((lesson, lessonIndex) => (
                    <TaskLesson
                        key={lesson.id}
                        lesson={lesson}
                        isOpen={
                            openLessons.has(lesson.id) ||
                            lessonIndex === 0 ||
                            activeLessonId === lesson.id
                        }
                        onToggleLesson={toggleLesson}
                        activeTaskId={activeTaskId}
                        taskStatusMap={taskStatusMap}
                        deadlineMap={deadlineMap}
                        now={now}
                        lockedIds={lockedIds}
                        onSelectTask={handleTaskClick}
                    />
                ))}

            </div>


            {/* ================================= */}
            {/* FOOTER */}
            {/* ================================= */}

            <div className="task-sidebar-footer">

                <span>
                    <CheckCircle2 size={14} />
                    Approved
                </span>

                <span>
                    <FiClock size={14} />
                    Pending
                </span>

                <span>
                    <FiLock size={14} />
                    Locked
                </span>

            </div>

        </motion.aside>
    );
}
