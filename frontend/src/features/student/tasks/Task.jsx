import {
    useEffect,
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

import {
    saveTaskState,
} from "../../../utils/taskStorage";
import {
    getTaskExpiresAt,
} from "./utils/taskUtils";

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

    const [now, setNow] = useState(() => Date.now());

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
    // CLOCK
    // -----------------------------------------

    useEffect(() => {
        const timer =
            window.setInterval(() => {
                setNow(Date.now());
            }, 1000);

        return () => {
            window.clearInterval(timer);
        };
    }, []);

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

        if (!modules.length) {
            return [];
        }

        // -----------------------------------------
        // SELECT MODULE
        // -----------------------------------------
        // If the user came from a specific module/lesson
        // in the Lessons page, ALWAYS show that module.
        // Do not replace it with the first incomplete module.

        const scopeModuleId =
            String(taskScope.moduleId || "").trim();

        const scopeLessonId =
            String(taskScope.lessonId || "").trim();

        let activeModule = null;

        if (scopeModuleId) {
            const requestedModuleIndex =
                modules.findIndex(
                    (module) =>
                        String(module.id) ===
                        scopeModuleId
                );

            if (requestedModuleIndex === 0) {
                activeModule =
                    modules[requestedModuleIndex];
            } else if (requestedModuleIndex > 0) {
                const previousModules =
                    modules.slice(
                        0,
                        requestedModuleIndex
                    );

                const previousModulesCompleted =
                    previousModules.every(
                        (module) =>
                            (module.tasks || []).length > 0 &&
                            (module.tasks || []).every(
                                (task) =>
                                    taskStatusMap[
                                        task.id
                                    ] === "approved"
                            )
                    );

                if (previousModulesCompleted) {
                    activeModule =
                        modules[requestedModuleIndex];
                }
            }
        }

        // Fallback when no module was supplied in route state.
        if (!activeModule) {

            let availableModuleIndex = 0;

            for (
                let moduleIndex = 0;
                moduleIndex < modules.length;
                moduleIndex++
            ) {

                const module =
                    modules[moduleIndex];

                const moduleTasks =
                    module.tasks || [];

                if (!moduleTasks.length) {
                    continue;
                }

                const moduleCompleted =
                    moduleTasks.every(
                        (task) =>
                            taskStatusMap[task.id] ===
                            "approved"
                    );

                if (!moduleCompleted) {
                    availableModuleIndex =
                        moduleIndex;

                    break;
                }

                availableModuleIndex =
                    Math.min(
                        moduleIndex + 1,
                        modules.length - 1
                    );
            }

            activeModule =
                modules[availableModuleIndex];
        }

        if (!activeModule) {
            return [];
        }

        // -----------------------------------------
        // SHOW ALL TASKS OF THIS MODULE
        // -----------------------------------------
        // IMPORTANT:
        // Do NOT remove tasks after the first pending task.
        // All lesson-wise tasks must remain visible.
        // lockedIds below decides which task can be opened.

        let availableTasks = [
            ...(activeModule.tasks || [])
        ];

        // -----------------------------------------
        // OPTIONAL LESSON SCOPE
        // -----------------------------------------
        // When the Lessons page sends a lessonId,
        // keep that lesson's tasks selected as the
        // initial visible task group.
        //
        // But if the requested lesson cannot be found,
        // keep the complete module visible.

        if (scopeModuleId === String(activeModule.id) &&
            scopeLessonId) {

            // We intentionally keep the complete
            // module visible so the student can see
            // all lesson-wise tasks.
        }

        // -----------------------------------------
        // REBUILD ALL LESSON GROUPS
        // -----------------------------------------
        // Keep every lesson and every task.
        // Locking is handled separately by lockedIds.

        const lessons =
            (activeModule.lessons || [])
                .map((lesson) => ({
                    ...lesson,
                    tasks: [
                        ...(lesson.tasks || [])
                    ],
                }))
                .filter(
                    (lesson) =>
                        lesson.tasks.length > 0
                );

        return [
            {
                ...activeModule,
                lessons,
                tasks: availableTasks,
            },
        ];

    }, [
        modules,
        taskStatusMap,
        taskScope.moduleId,
        taskScope.lessonId,
    ]);

    const visibleTasks = useMemo(() => {
        return scopedModules.flatMap(
            (module) => module.tasks
        );
    }, [scopedModules]);

    const selectedTaskId = useMemo(() => {

        if (!visibleTasks.length) {
            return null;
        }

        // -----------------------------------------
        // 1. KEEP EXPLICITLY ACTIVE TASK
        // -----------------------------------------

        const activeIsVisible =
            visibleTasks.some(
                (task) =>
                    task.id === activeTaskId
            );

        if (activeIsVisible) {
            return activeTaskId;
        }

        // -----------------------------------------
        // 2. AFTER APPROVAL, SELECT FIRST
        //    NON-APPROVED TASK
        // -----------------------------------------

        const firstAvailableTask =
            visibleTasks.find(
                (task) => {
                    const status =
                        taskStatusMap[task.id];

                    return (
                        status !== "approved" &&
                        status !== "expired"
                    );
                }
            );

        if (firstAvailableTask) {
            return firstAvailableTask.id;
        }

        // -----------------------------------------
        // 3. REQUESTED TASK
        // -----------------------------------------

        const requestedTaskId =
            String(
                taskScope.taskId || ""
            ).trim();

        const requestedTask =
            visibleTasks.find(
                (task) =>
                    requestedTaskId &&
                    (
                        task.id ===
                            requestedTaskId ||
                        task.taskId ===
                            requestedTaskId
                    )
            );

        if (requestedTask) {
            return requestedTask.id;
        }

        // -----------------------------------------
        // 4. INITIAL TASK FALLBACK
        // -----------------------------------------

        const initialTask =
            visibleTasks.find(
                (task) =>
                    task.id ===
                    initialTaskId
            );

        if (initialTask) {
            return initialTask.id;
        }

        return visibleTasks[0]?.id || null;

    }, [
        activeTaskId,
        initialTaskId,
        taskScope.taskId,
        taskStatusMap,
        visibleTasks,
    ]);

    // -----------------------------------------
    // LOCKED TASKS
    // -----------------------------------------

    const lockedIds = useMemo(() => {

        const locked = new Set();

        const scopedTasks = visibleTasks;

        // -----------------------------------------
        // SEQUENTIAL TASK LOCKING
        // -----------------------------------------
        // Task 1 is open.
        //
        // Task N is unlocked ONLY when every task
        // before it has been approved.
        //
        // Example:
        //
        // Task 1 = approved
        // Task 2 = pending
        // Task 3 = locked
        // Task 4 = locked
        //
        // After Task 2 becomes approved:
        //
        // Task 3 = unlocked
        // Task 4 = locked
        //
        // This guarantees strict sequential progress.

        for (
            let index = 1;
            index < scopedTasks.length;
            index++
        ) {

            const hasUnapprovedPreviousTask =
                scopedTasks
                    .slice(0, index)
                    .some(
                        (previousTask) =>
                            taskStatusMap[
                                previousTask.id
                            ] !== "approved"
                    );

            if (hasUnapprovedPreviousTask) {

                locked.add(
                    scopedTasks[index].id
                );

            }
        }

        return locked;

    }, [
        visibleTasks,
        taskStatusMap,
    ]);

    // -----------------------------------------
    // DEADLINE
    // -----------------------------------------
    // Deadline is controlled by backend submission state.
    // Do NOT create a new timer on the frontend.

    // -----------------------------------------
    // CURRENT TASK
    // -----------------------------------------

    const currentTask = useMemo(() => {
        return (
            allTasks.find(
                (task) =>
                    task.id ===
                    selectedTaskId
            ) || null
        );
    }, [
        allTasks,
        selectedTaskId,
    ]);

    // -----------------------------------------
    // CURRENT MODULE
    // -----------------------------------------

    const currentModule = useMemo(() => {
        if (!currentTask) {
            return null;
        }

        return (
            modules.find(
                (module) =>
                    module.id ===
                    currentTask.moduleId
            ) || null
        );
    }, [
        modules,
        currentTask,
    ]);

    // -----------------------------------------
    // CURRENT TASK STATE
    // -----------------------------------------
    const currentDeadline =
        currentTask
            ? deadlineMap[
            currentTask.id
            ]
            : null;

    const currentStatus =
        currentTask
            ? taskStatusMap[
            currentTask.id
            ]
            : null;

    const currentReviewComment =
        currentTask
            ? reviewCommentMap[currentTask.id] || ""
            : "";

    const currentExpired =
        currentStatus === "expired" ||
        (
            getTaskExpiresAt(currentDeadline) &&
            currentStatus !== "approved" &&
            new Date(
                getTaskExpiresAt(currentDeadline)
            ).getTime() <= now
        );

    // -----------------------------------------
    // AUTO EXPIRE
    // -----------------------------------------

    useEffect(() => {
        if (
            !currentTask ||
            !currentExpired ||
            currentStatus ===
            "expired"
        ) {
            return;
        }

        setTaskStatusMap((prev) => {
            const next = {
                ...prev,
                [currentTask.id]:
                    "expired",
            };

            saveTaskState(
                courseSlug,
                next
            );

            return next;
        });
    }, [
        courseSlug,
        currentExpired,
        currentStatus,
        currentTask,
        setTaskStatusMap,
    ]);

    // -----------------------------------------
    // COMPLETION
    // -----------------------------------------

    const approvedCount =
        useMemo(() => {
            return allTasks.filter(
                (task) =>
                    taskStatusMap[
                    task.id
                    ] === "approved"
            ).length;
        }, [
            allTasks,
            taskStatusMap,
        ]);

    // Current module progress only.
    // This is used by the Task page progress UI.
    const currentModuleApprovedCount =
        visibleTasks.filter(
            (task) =>
                taskStatusMap[task.id] ===
                "approved"
        ).length;

    // Certificate unlocks ONLY when every task
    // across every module of the course is approved.
    const allCompleted =
        allTasks.length > 0 &&
        approvedCount ===
        allTasks.length;

    // -----------------------------------------
    // GLOBAL COMPLETION SIGNAL
    // -----------------------------------------

    useEffect(() => {
        try {
            localStorage.setItem(
                "all_tasks_completed",
                allCompleted
                    ? "true"
                    : "false"
            );
        } catch {
            // Ignore localStorage errors.
        }
    }, [allCompleted]);

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

        const deadline =
            deadlineMap[taskId];

        const expiresAt =
            deadline?.expiresAt;

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
