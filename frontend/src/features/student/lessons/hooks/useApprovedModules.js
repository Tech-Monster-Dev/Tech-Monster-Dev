import { useEffect, useState } from "react";

import api from "../../../../services/api/axios";
import { API } from "../../../../services/api/endpoints";

const useApprovedModules = (
    courseSlug,
    lessonData
) => {

    const [approvedModuleIds, setApprovedModuleIds] =
        useState(new Set());

    useEffect(() => {

        if (
            !courseSlug ||
            !Array.isArray(lessonData?.modules)
        ) {
            return;
        }

        let active = true;

        const fetchApprovedModules = async () => {

            // =========================================
            // BACKEND SUBMISSIONS
            // =========================================

            try {

                const response =
                    await api.get(
                        API.SUBMISSIONS.COURSE(
                            courseSlug
                        )
                    );

                const submissions =
                    response?.data?.submissions || [];


                // =========================================
                // APPROVED TASK KEYS
                // =========================================

                const approvedTaskKeys =
                    new Set(
                        submissions
                            .filter(
                                (submission) =>
                                    submission.status ===
                                    "approved"
                            )
                            .map(
                                (submission) =>
                                    [
                                        String(
                                            submission.moduleId
                                        ),
                                        String(
                                            submission.lessonId ||
                                            ""
                                        ),
                                        String(
                                            submission.taskId
                                        ),
                                    ].join("_")
                            )
                    );


                // =========================================
                // FIND FULLY APPROVED MODULES
                // =========================================

                const fullyApprovedModules =
                    new Set();


                lessonData.modules.forEach(
                    (module) => {

                        const moduleId =
                            String(
                                module.id ||
                                module.moduleId ||
                                ""
                            );


                        const tasks =
                            (module.sections || [])
                                .flatMap(
                                    (section) =>
                                        section.tasks || []
                                );


                        // No tasks = don't unlock
                        // next module based on this module.
                        if (!tasks.length) {
                            return;
                        }


                        const allTasksApproved =
                            tasks.every(
                                (task) => {

                                    const taskId =
                                        String(
                                            task.taskId ||
                                            task.id ||
                                            ""
                                        );

                                    const lessonId =
                                        String(
                                            task.lessonId ||
                                            ""
                                        );

                                    const key =
                                        [
                                            moduleId,
                                            lessonId,
                                            taskId,
                                        ].join("_");

                                    return approvedTaskKeys.has(
                                        key
                                    );
                                }
                            );


                        if (
                            allTasksApproved
                        ) {

                            fullyApprovedModules.add(
                                moduleId
                            );

                        }

                    }
                );


                if (!active) {
                    return;
                }


                setApprovedModuleIds(
                    fullyApprovedModules
                );


                localStorage.setItem(
                    `approvedModules_${courseSlug}`,
                    JSON.stringify(
                        [
                            ...fullyApprovedModules
                        ]
                    )
                );

            } catch (error) {

                console.error(
                    "Failed to load approved modules:",
                    error
                );

                // Keep existing cached state
                try {

                    const raw =
                        localStorage.getItem(
                            `approvedModules_${courseSlug}`
                        );

                    if (raw && active) {

                        const cached =
                            JSON.parse(raw);

                        if (
                            Array.isArray(
                                cached
                            )
                        ) {

                            setApprovedModuleIds(
                                new Set(cached)
                            );

                        }

                    }

                } catch {
                    // Ignore cache errors
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
    ]);

    return approvedModuleIds;
};

export default useApprovedModules;