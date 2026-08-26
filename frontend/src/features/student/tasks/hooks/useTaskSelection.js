import { useMemo } from "react";

const useTaskSelection = ({
    visibleTasks,
    activeTaskId,
    initialTaskId,
    requestedTaskId,
    taskStatusMap,
}) => {
    const selectedTaskId = useMemo(() => {
        if (!visibleTasks.length) {
            return null;
        }

        const activeIsVisible = visibleTasks.some(
            (task) => task.id === activeTaskId
        );

        if (activeIsVisible) {
            return activeTaskId;
        }

        const firstAvailableTask = visibleTasks.find(
            (task) => {
                const status = taskStatusMap[task.id];

                return (
                    status !== "approved" &&
                    status !== "expired"
                );
            }
        );

        if (firstAvailableTask) {
            return firstAvailableTask.id;
        }

        const requestedTask = visibleTasks.find(
            (task) =>
                requestedTaskId &&
                (
                    task.id === requestedTaskId ||
                    task.taskId === requestedTaskId
                )
        );

        if (requestedTask) {
            return requestedTask.id;
        }

        const initialTask = visibleTasks.find(
            (task) => task.id === initialTaskId
        );

        if (initialTask) {
            return initialTask.id;
        }

        return visibleTasks[0]?.id || null;
    }, [
        visibleTasks,
        activeTaskId,
        initialTaskId,
        requestedTaskId,
        taskStatusMap,
    ]);

    return selectedTaskId;
};

export default useTaskSelection;
