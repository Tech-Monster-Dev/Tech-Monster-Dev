import { motion } from "framer-motion";
import {
    CheckCircle2,
    BookOpenCheck,
} from "lucide-react";

import {
    FiClock,
    FiLock,
} from "react-icons/fi";

import TaskItem from "./TaskLesson/TaskItem/TaskItem";
import EmptyState from "../../../../../components/ui/EmptyState";

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
    const moduleList = Array.isArray(modules)
        ? modules
        : modules
            ? [modules]
            : [];

    const activeModule = moduleList[0] || null;
    const tasks = activeModule?.tasks || [];

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

            <div className="task-sidebar-list">
                {!activeModule || tasks.length === 0 ? (
                    <EmptyState
                        compact
                        heading="No Tasks Yet"
                        paragraph="There are no tasks available for this module yet."
                    />
                ) : (
                    <>
                        <div className="task-sidebar-module">
                            <div className="task-sidebar-module-header">
                                <div className="task-sidebar-module-icon">
                                    <BookOpenCheck size={16} />
                                </div>

                                <div>
                                    <h4>
                                        {activeModule.title}
                                    </h4>

                                    <span>
                                        {tasks.length} Tasks
                                    </span>
                                </div>
                            </div>

                            <div className="task-sidebar-task-list">
                                {tasks.map((task) => (
                                    <TaskItem
                                        key={task.id}
                                        task={task}
                                        active={
                                            activeTaskId === task.id
                                        }
                                        taskStatusMap={
                                            taskStatusMap
                                        }
                                        deadlineMap={
                                            deadlineMap
                                        }
                                        now={now}
                                        lockedIds={
                                            lockedIds
                                        }
                                        onSelectTask={
                                            onSelectTask
                                        }
                                    />
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>

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
