import {
    useMemo,
    useState,
} from "react";

import {
    useLocation,
    useNavigate,
    useParams,
} from "react-router-dom";

import { motion } from "framer-motion";
import { toast } from "react-toastify";

import useAuth from "../../../shared/hooks/useAuth";

import TaskHeader from "./components/TaskHeader";
import TaskModuleSidebar from "./components/TaskModuleSidebar";
import TaskDetailView from "./components/TaskDetailView";
import CodeSubmission from "./components/CodeSubmission";
import TaskStatusNotice from "./components/TaskStatusNotice";
import CertificateBanner from "./components/CertificateBanner";
import TaskDeadlineCard from "./components/TaskDeadlineCard";
import Spinner from '../../dashboard/common/LoaderPage/Spinner';

import useTaskData from "./hooks/useTaskData";
import useTaskRealtime from "./hooks/useTaskRealtime";
import useTaskSubmission from "./hooks/useTaskSubmission";
import useTaskClock from "./hooks/useTaskClock";
import useTaskSelection from "./hooks/useTaskSelection";
import useTaskLocking from "./hooks/useTaskLocking";
import useTaskLifecycle from "./hooks/useTaskLifecycle";

import {
} from "../../../utils/taskStorage";
import {
} from "./utils/taskUtils";
import {
    getScopedTaskModule,
    buildScopedTaskModule,
} from "./utils/taskModuleScope";

import "./Task.css";

const Task = () => {
    const {
        type: routeType,
        slug,
        courseSlug: routeCourseSlug,
    } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const contentType = routeType === "internship" ? "internship" : "course";
    const taskScope = location.state || {};

    const { user } = useAuth();

    const [activeTaskId, setActiveTaskId] = useState(null);

    const now = useTaskClock();

    // -----------------------------------------
    // TASK DATA
    // -----------------------------------------
    const {
        courseSlug,
        courseTitle,
        studentName,
        modules,
        initialTaskId,

        loading,
        error,

        taskStatusMap,
        setTaskStatusMap,

        deadlineMap,
        setDeadlineMap,

        submittedAtMap,
        setSubmittedAtMap,
        reviewCommentMap,
        setReviewCommentMap,

        applySubmissionState,
    } = useTaskData({
        contentType,
        routeCourseSlug,
        slug,
    });

    // -----------------------------------------
    // REALTIME SOCKET
    // -----------------------------------------

    useTaskRealtime({
        user,
        courseSlug,
        applySubmissionState,
        setActiveTaskId,
        onModuleCompleted: () => {
            try {
                localStorage.setItem(
                    "daily_task_unlocked_" + courseSlug,
                    "false"
                );
            } catch {
                // Ignore localStorage errors.
            }

            window.dispatchEvent(
                new CustomEvent(
                    "dailyTaskAccessChanged",
                    {
                        detail: {
                            courseSlug,
                            unlocked: false,
                            moduleId: null,
                        },
                    }
                )
            );

            toast.success(
                "Module completed. Returning to lessons..."
            );

            navigate(
                "/student/lessons/" +
                contentType +
                "/" +
                courseSlug
            );
        },
    });

    // -----------------------------------------
    // ALL TASKS
    // -----------------------------------------

    const allTasks = useMemo(() => {
        return modules.flatMap(
            (module) => module.tasks
        );
    }, [modules]);

    const scopedModules = useMemo(() => {
        const moduleId = String(
            taskScope.moduleId || ""
        ).trim();

        console.log("=== TASK MODULE SCOPE DEBUG ===");
        console.log("taskScope:", taskScope);
        console.log("requested moduleId:", moduleId);
        console.log("modules:", modules);
        console.log("taskStatusMap:", taskStatusMap);

        const activeModule = getScopedTaskModule(
            modules,
            taskStatusMap,
            moduleId
        );

        if (!activeModule) {
            return [];
        }

        const scopedModule = buildScopedTaskModule(
            activeModule
        );

        return scopedModule ? [scopedModule] : [];
    }, [
        modules,
        taskStatusMap,
        taskScope.moduleId,
    ]);

    const visibleTasks = useMemo(() => {
        return scopedModules.flatMap(
            (module) => module.tasks
        );
    }, [scopedModules]);

    const requestedTaskId = String(
        taskScope.taskId || ""
    ).trim();

    const selectedTaskId = useTaskSelection({
        visibleTasks,
        activeTaskId,
        initialTaskId,
        requestedTaskId,
        taskStatusMap,
    });

    const lockedIds = useTaskLocking({
        visibleTasks,
        taskStatusMap,
    });

    // -----------------------------------------
    // DEADLINE
    // -----------------------------------------
    // Deadline is controlled by backend submission state.
    // Do NOT create a new timer on the frontend.

    const {
        currentTask,
        currentModule,
        currentDeadline,
        currentStatus,
        currentReviewComment,
        currentExpired,
        currentModuleApprovedCount,
        allCompleted,
    } = useTaskLifecycle({
        allTasks,
        visibleTasks,
        modules,
        selectedTaskId,
        taskStatusMap,
        setTaskStatusMap,
        deadlineMap,
        reviewCommentMap,
        courseSlug,
        now,
    });

    // -----------------------------------------
    // TASK SELECT
    // -----------------------------------------

    const handleSelectTask = (
        taskId
    ) => {

        // -----------------------------------------
        // LOCKED TASK
        // -----------------------------------------

        if (
            lockedIds.has(taskId)
        ) {
            toast.warning(
                "Complete the current task first!"
            );
            return;
        }

        // -----------------------------------------
        // EXPIRED TASK
        // -----------------------------------------

        const deadline = deadlineMap[taskId];

        const expiresAt = deadline?.expiresAt;

        const expiredByTime =
            expiresAt &&
            new Date(expiresAt).getTime() <=
                Date.now();

        const alreadyExpired =
            taskStatusMap[taskId] ===
            "expired";

        if (
            alreadyExpired ||
            expiredByTime
        ) {

            toast.warning(
                "This task has expired. Contact Admin Support to extend more time to complete this task."
            );

            return;
        }

        // -----------------------------------------
        // OPEN TASK
        // -----------------------------------------

        setActiveTaskId(taskId);
    };

    // -----------------------------------------
    // SUBMISSION
    // -----------------------------------------

    const {
        submitting,
        handleSubmit,
    } = useTaskSubmission({
        courseSlug,
        allTasks,
        currentModule,
        taskStatusMap,
        setTaskStatusMap,
        setDeadlineMap,
        setSubmittedAtMap,
        setReviewCommentMap,
    });

    // -----------------------------------------
    // LOADING
    // -----------------------------------------

    if (loading) {
        return (
            <motion.div
                className="tasks-page task-page-loading"
                initial={{
                    opacity: 0,
                }}
                animate={{
                    opacity: 1,
                }}
            >
                <Spinner message="Loading tasks..." size={60} />
            </motion.div>
        );
    }

    // -----------------------------------------
    // ERROR / EMPTY
    // -----------------------------------------

    if (
        error ||
        !modules.length ||
        !visibleTasks.length
    ) {
        return (
            <motion.div
                className="tasks-page task-page-loading"
                initial={{
                    opacity: 0,
                }}
                animate={{
                    opacity: 1,
                }}
            >
                {error || "No tasks found for this internship."}
            </motion.div>
        );
    }

    // -----------------------------------------
    // UI
    // -----------------------------------------

    return (
        <motion.div
            className="tasks-page"
            initial={{
                opacity: 0,
            }}
            animate={{
                opacity: 1,
            }}
            transition={{
                duration: 0.4,
            }}
        >
            <TaskHeader
                studentName={studentName}
                internshipTitle={courseTitle}
                moduleTitle={currentModule?.title || ""}
                completedCount={currentModuleApprovedCount}
                totalCount={visibleTasks.length}
            />

            <div className="tasks-layout">
                <TaskModuleSidebar
                    contentType={contentType}
                    modules={scopedModules}
                    activeTaskId={selectedTaskId}
                    taskStatusMap={taskStatusMap}
                    deadlineMap={deadlineMap}
                    now={now}
                    lockedIds={[
                        ...lockedIds,
                    ]}
                    onSelectTask={handleSelectTask}
                />

                <div className="tasks-main">
                    {currentTask ? (
                        <>
                            {currentStatus === "rejected" && currentReviewComment && (
                                <div className="task-review-reason">
                                    <strong>Admin Review Reason</strong>
                                    <p>{currentReviewComment}</p>
                                </div>
                            )}

                            <TaskDetailView
                                task={
                                    currentTask
                                }
                            />

                            <TaskStatusNotice
                                submittedAt={
                                    submittedAtMap[
                                    currentTask.id
                                    ] || null
                                }
                                status={
                                    taskStatusMap[
                                    currentTask.id
                                    ]
                                }
                            />

                            <TaskDeadlineCard
                                deadline={
                                    currentDeadline
                                }
                                now={now}
                                expired={
                                    currentExpired
                                }
                                status={
                                    currentStatus
                                }
                            />

                            {currentStatus !== "pending" &&
                                currentStatus !== "approved" &&
                                currentStatus !== "expired" && (
                                    <CodeSubmission
                                        task={
                                            currentTask
                                        }
                                        onSubmit={
                                            handleSubmit
                                        }
                                        submitting={
                                            submitting
                                        }
                                        disabled={
                                            lockedIds.has(
                                                currentTask.id
                                            ) ||
                                            currentExpired
                                        }
                                        expired={
                                            currentExpired
                                        }
                                    />
                                )}
                        </>
                    ) : (
                        <div className="tasks-main-empty">
                            Select a task to get
                            started.
                        </div>
                    )}
                </div>
            </div>

            <CertificateBanner
                completedCount={
                    currentModuleApprovedCount
                }
                totalCount={
                    visibleTasks.length
                }
                allCompleted={
                    allCompleted
                }
            />
        </motion.div>
    );
};

export default Task;