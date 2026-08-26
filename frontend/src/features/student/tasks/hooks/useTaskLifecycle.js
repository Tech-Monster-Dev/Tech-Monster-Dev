import { useEffect, useMemo } from "react";

import {
    saveTaskState,
} from "../../../../utils/taskStorage";

import {
    getTaskExpiresAt,
} from "../utils/taskUtils";

const useTaskLifecycle = ({
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
}) => {
    const currentTask = useMemo(() => {
        return (
            allTasks.find(
                (task) =>
                    task.id === selectedTaskId
            ) || null
        );
    }, [
        allTasks,
        selectedTaskId,
    ]);

    const currentModule = useMemo(() => {
        if (!currentTask) {
            return null;
        }

        return (
            modules.find(
                (module) =>
                    module.id === currentTask.moduleId
            ) || null
        );
    }, [
        modules,
        currentTask,
    ]);

    const currentDeadline = currentTask
        ? deadlineMap[currentTask.id]
        : null;

    const currentStatus = currentTask
        ? taskStatusMap[currentTask.id]
        : null;

    const currentReviewComment = currentTask
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

    useEffect(() => {
        if (
            !currentTask ||
            !currentExpired ||
            currentStatus === "expired"
        ) {
            return;
        }

        setTaskStatusMap((prev) => {
            const next = {
                ...prev,
                [currentTask.id]: "expired",
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

    const approvedCount = useMemo(() => {
        return allTasks.filter(
            (task) =>
                taskStatusMap[task.id] === "approved"
        ).length;
    }, [
        allTasks,
        taskStatusMap,
    ]);

    const currentModuleApprovedCount =
        visibleTasks.filter(
            (task) =>
                taskStatusMap[task.id] === "approved"
        ).length;

    const allCompleted =
        allTasks.length > 0 &&
        approvedCount === allTasks.length;

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

    return {
        currentTask,
        currentModule,
        currentDeadline,
        currentStatus,
        currentReviewComment,
        currentExpired,
        approvedCount,
        currentModuleApprovedCount,
        allCompleted,
    };
};

export default useTaskLifecycle;
