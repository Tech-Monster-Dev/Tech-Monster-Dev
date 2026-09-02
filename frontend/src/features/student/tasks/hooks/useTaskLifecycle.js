import { useEffect, useMemo } from "react";

import {
    saveTaskState,
} from "../../../../utils/taskStorage";

import {
    getTaskExpiresAt,
    getTaskKey,
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

    const currentTaskKey = currentTask
        ? getTaskKey({
            moduleId: currentTask.moduleId,
            lessonId: currentTask.lessonId,
            taskId:
                currentTask.taskId ||
                currentTask.id,
        })
        : "";

    const currentDeadline = currentTaskKey
        ? deadlineMap[currentTaskKey]
        : null;

    const currentStatus = currentTaskKey
        ? taskStatusMap[currentTaskKey]
        : null;

    const currentReviewComment = currentTaskKey
        ? reviewCommentMap[currentTaskKey] || ""
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
                [currentTaskKey]: "expired",
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
        currentTaskKey,
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
        currentTaskKey,
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
