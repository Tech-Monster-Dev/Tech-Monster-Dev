import { useCallback, useEffect, useState } from "react";

import api from "../../../../services/api/axios";
import { API } from "../../../../services/api/endpoints";
import { socket } from "../../../../services/socket/socket";

const normalizeId = (value) =>
    String(value || "").trim();

const getTaskKey = ({
    moduleId,
    lessonId,
    taskId,
}) => {
    const normalizedModuleId =
        normalizeId(moduleId);

    const normalizedLessonId =
        normalizeId(lessonId);

    const normalizedTaskId =
        normalizeId(taskId);

    if (
        !normalizedModuleId ||
        !normalizedTaskId
    ) {
        return "";
    }

    return normalizedLessonId
        ? [
            normalizedModuleId,
            normalizedLessonId,
            normalizedTaskId,
        ].join("_")
        : [
            normalizedModuleId,
            normalizedTaskId,
        ].join("_");
};

const getModuleId = (module) =>
    normalizeId(
        module?.id ||
        module?.moduleId
    );

const getModuleTasks = (module) => {
    if (!module) {
        return [];
    }

    const tasks = [];

    /*
     * Lesson data structure:
     * module.sections[].tasks[]
     */
    (module.sections || []).forEach(
        (section) => {
            (section.tasks || []).forEach(
                (task) => {
                    tasks.push({
                        ...task,
                        lessonId:
                            task.lessonId ||
                            section.id,
                    });
                }
            );
        }
    );

    /*
     * Also support module-level tasks.
     * This keeps the hook compatible with
     * the course task structure.
     */
    (module.tasks || []).forEach(
        (task) => {
            tasks.push({
                ...task,
                lessonId:
                    task.lessonId ||
                    "",
            });
        }
    );

    return tasks;
};

export default function useApprovedModules(
    courseSlug,
    lessonData
) {
    const [
        approvedModuleIds,
        setApprovedModuleIds,
    ] = useState(new Set());

    const calculateApprovedModules =
        useCallback(
            (submissions) => {
                if (
                    !Array.isArray(
                        lessonData?.modules
                    )
                ) {
                    return new Set();
                }

                const approvedTaskKeys =
                    new Set(
                        (submissions || [])
                            .filter(
                                (submission) =>
                                    submission?.status ===
                                    "approved"
                            )
                            .map(
                                (submission) =>
                                    getTaskKey({
                                        moduleId:
                                            submission.moduleId,
                                        lessonId:
                                            submission.lessonId,
                                        taskId:
                                            submission.taskId,
                                    })
                            )
                            .filter(Boolean)
                    );

                const fullyApprovedModules =
                    new Set();

                lessonData.modules.forEach(
                    (module) => {
                        const moduleId =
                            getModuleId(module);

                        if (!moduleId) {
                            return;
                        }

                        const tasks =
                            getModuleTasks(module);

                        if (!tasks.length) {
                            return;
                        }

                        const allTasksApproved =
                            tasks.every(
                                (task) => {
                                    const taskId =
                                        normalizeId(
                                            task.taskId ||
                                            task.id
                                        );

                                    const lessonId =
                                        normalizeId(
                                            task.lessonId
                                        );

                                    const key =
                                        getTaskKey({
                                            moduleId,
                                            lessonId,
                                            taskId,
                                        });

                                    return (
                                        key &&
                                        approvedTaskKeys.has(
                                            key
                                        )
                                    );
                                }
                            );

                        if (allTasksApproved) {
                            fullyApprovedModules.add(
                                moduleId
                            );
                        }
                    }
                );

                return fullyApprovedModules;
            },
            [lessonData]
        );

    /*
     * =========================================
     * INITIAL / REFRESH LOAD
     * =========================================
     */
    useEffect(() => {
        if (
            !courseSlug ||
            !Array.isArray(
                lessonData?.modules
            )
        ) {
            return;
        }

        let active = true;

        const fetchApprovedModules =
            async () => {
                try {
                    const response =
                        await api.get(
                            API.SUBMISSIONS.COURSE(
                                courseSlug
                            )
                        );

                    const submissions =
                        response?.data
                            ?.submissions || [];

                    const fullyApprovedModules =
                        calculateApprovedModules(
                            submissions
                        );

                    if (!active) {
                        return;
                    }

                    setApprovedModuleIds(
                        fullyApprovedModules
                    );

                    localStorage.setItem(
                        `approvedModules_${courseSlug}`,
                        JSON.stringify([
                            ...fullyApprovedModules,
                        ])
                    );
                } catch (error) {
                    console.error(
                        "Failed to load approved modules:",
                        error
                    );

                    try {
                        const raw =
                            localStorage.getItem(
                                `approvedModules_${courseSlug}`
                            );

                        if (
                            raw &&
                            active
                        ) {
                            const cached =
                                JSON.parse(
                                    raw
                                );

                            if (
                                Array.isArray(
                                    cached
                                )
                            ) {
                                setApprovedModuleIds(
                                    new Set(
                                        cached.map(
                                            normalizeId
                                        )
                                    )
                                );
                            }
                        }
                    } catch {
                        // Ignore cache errors.
                    }
                }
            };

        fetchApprovedModules();

        return () => {
            active = false;
        };
    }, [
        courseSlug,
        lessonData,
        calculateApprovedModules,
    ]);

    /*
     * =========================================
     * REALTIME TASK APPROVAL
     * =========================================
     *
     * Lessons page owns approved-module state,
     * so it must listen directly to the same
     * socket room used by task approvals.
     *
     * This guarantees:
     *
     * Admin approves final task
     *       ↓
     * taskApproved received here
     *       ↓
     * submissions refreshed immediately
     *       ↓
     * fully-approved module recalculated
     *       ↓
     * next module unlocks without refresh
     */
    useEffect(() => {
        if (!courseSlug) {
            return;
        }

        const handleTaskApproved = async ({
            submission,
        } = {}) => {
            if (!submission) {
                return;
            }

            const submissionCourse =
                normalizeId(
                    submission.courseSlug
                ).toLowerCase();

            const currentCourse =
                normalizeId(
                    courseSlug
                ).toLowerCase();

            if (
                submissionCourse &&
                submissionCourse !== currentCourse
            ) {
                return;
            }

            try {
                const response =
                    await api.get(
                        API.SUBMISSIONS.COURSE(
                            courseSlug
                        )
                    );

                const submissions =
                    response?.data
                        ?.submissions || [];

                const fullyApprovedModules =
                    calculateApprovedModules(
                        submissions
                    );

                setApprovedModuleIds(
                    fullyApprovedModules
                );

                localStorage.setItem(
                    `approvedModules_${courseSlug}`,
                    JSON.stringify([
                        ...fullyApprovedModules,
                    ])
                );

                window.dispatchEvent(
                    new CustomEvent(
                        "moduleApprovalChanged",
                        {
                            detail: {
                                courseSlug,
                                approvedModuleIds: [
                                    ...fullyApprovedModules,
                                ],
                                approvedSubmission:
                                    submission,
                            },
                        }
                    )
                );
            } catch (error) {
                console.error(
                    "Failed to refresh approved modules after realtime task approval:",
                    error
                );
            }
        };

        socket.on(
            "taskApproved",
            handleTaskApproved
        );

        return () => {
            socket.off(
                "taskApproved",
                handleTaskApproved
            );
        };
    }, [
        courseSlug,
        calculateApprovedModules,
    ]);

    return approvedModuleIds;
}
