import {
    addModuleTasks,
    addLessonTasks,
} from "./courseTaskBuilder.utils.js";

export const getOrderedCourseTasks =
    (courseData) => {
        if (
            !Array.isArray(
                courseData?.modules
            )
        ) {
            return [];
        }

        const orderedTasks = [];
        const seen = new Set();

        courseData.modules.forEach(
            (module, moduleIndex) => {
                const moduleId =
                    String(
                        module.moduleId ||
                        module.id ||
                        `module-${moduleIndex + 1}`
                    ).trim();

                const moduleTitle =
                    module.moduleTitle ||
                    module.title ||
                    `Module ${moduleIndex + 1}`;

                addModuleTasks(
                    orderedTasks,
                    seen,
                    courseData,
                    module,
                    moduleId,
                    moduleTitle
                );

                addLessonTasks(
                    orderedTasks,
                    seen,
                    courseData,
                    module,
                    moduleId,
                    moduleTitle
                );
            }
        );

        return orderedTasks;
    };
