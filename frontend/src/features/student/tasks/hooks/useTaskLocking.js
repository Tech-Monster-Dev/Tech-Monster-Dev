import { useMemo } from "react";

const useTaskLocking = ({
    visibleTasks,
    taskStatusMap,
}) => {
    const lockedIds = useMemo(() => {
        const locked = new Set();

        for (
            let index = 1;
            index < visibleTasks.length;
            index++
        ) {
            const hasUnapprovedPreviousTask =
                visibleTasks
                    .slice(0, index)
                    .some(
                        (task) =>
                            taskStatusMap[task.id] !==
                            "approved"
                    );

            if (hasUnapprovedPreviousTask) {
                locked.add(
                    visibleTasks[index].id
                );
            }
        }

        return locked;
    }, [
        visibleTasks,
        taskStatusMap,
    ]);

    return lockedIds;
};

export default useTaskLocking;
