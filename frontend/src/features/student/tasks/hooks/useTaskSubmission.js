import { useState } from "react";

import { toast } from "react-toastify";

import api from "../../../../services/api/axios";

import { saveTaskState } from "../../../../utils/taskStorage";
import useAuth from "../../../../shared/hooks/useAuth";

const useTaskSubmission = ({
    courseSlug,
    allTasks,
    currentModule,
    taskStatusMap,
    setTaskStatusMap,
    setDeadlineMap,
    setSubmittedAtMap,
}) => {
    const {user} = useAuth();
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (
        taskId,
        code
    ) => {
        if (!taskId || !code?.trim()) {
            return;
        }

        if (
            taskStatusMap[taskId] ===
            "expired"
        ) {
            toast.error(
                "This task deadline has expired. Please contact support."
            );

            return;
        }

        setSubmitting(true);

        try {
            const task = allTasks.find((item) => String(item.id) === String(taskId) || String(item.taskId) === String(taskId)) || null;

            const response = await api.post(
                "/submissions",
                {
                    courseSlug,
                    moduleId: task?.moduleId || "",
                    moduleTitle: currentModule?.title || "",
                    lessonId: task?.lessonId || "",
                    taskId: task?.taskId || taskId,
                    taskTitle: task?.title || "",
                    problemStatement:
                        task?.problemStatement || "",
                    code,
                }
            );

            const submission = response?.data?.submission || null;

            const nowIso = new Date().toISOString();

            const nextStatus = {
                ...taskStatusMap,
                [taskId]: "pending",
            };

            setTaskStatusMap(nextStatus);

            saveTaskState(
                user?._id || user?.id,
                courseSlug,
                nextStatus
            );

            setSubmittedAtMap(
                (prev) => ({
                    ...prev,
                    [taskId]:
                        submission?.submittedAt ||
                        nowIso,
                })
            );

            if (setDeadlineMap && submission) {
                setDeadlineMap((prev) => ({
                    ...prev,
                    [taskId]: {
                        unlockedAt:
                            submission.unlockedAt ||
                            null,
                        expiresAt:
                            submission.expiresAt ||
                            null,
                        expiredAt:
                            submission.expiredAt ||
                            null,
                    },
                }));
            }

            toast.success(
                "Task submitted for approval!"
            );
        } catch (error) {
            const message =
                error?.response?.data
                    ?.message ||
                "Failed to submit task. Please try again.";

            toast.error(message);
        } finally {
            setSubmitting(false);
        }
    };

    return {
        submitting,
        handleSubmit,
    };
};

export default useTaskSubmission;
