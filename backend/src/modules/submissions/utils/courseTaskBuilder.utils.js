import {
    addTask,
} from "./courseTaskItem.utils.js";

export const addModuleTasks = (
    orderedTasks,
    seen,
    courseData,
    module,
    moduleId,
    moduleTitle
) => {
    if (!Array.isArray(module.tasks)) {
        return;
    }

    module.tasks.forEach(
        (task, taskIndex) => {
            const taskId =
                String(
                    task.taskId ||
                    task.id ||
                    `task-${taskIndex + 1}`
                ).trim();

            const lessonId =
                String(
                    task.lessonId || ""
                ).trim();

            addTask(
                orderedTasks,
                seen,
                courseData,
                moduleId,
                moduleTitle,
                lessonId,
                taskId,
                task
            );
        }
    );
};

export const addLessonTasks = (
    orderedTasks,
    seen,
    courseData,
    module,
    moduleId,
    moduleTitle
) => {
    if (
        !Array.isArray(
            module.lessons
        )
    ) {
        return;
    }

    module.lessons.forEach(
        (lesson, lessonIndex) => {
            const lessonId =
                String(
                    lesson.lessonId ||
                    lesson.id ||
                    `lesson-${lessonIndex + 1}`
                ).trim();

            if (
                !Array.isArray(
                    lesson.tasks
                )
            ) {
                return;
            }

            lesson.tasks.forEach(
                (task, taskIndex) => {
                    const taskId =
                        String(
                            task.taskId ||
                            task.id ||
                            `task-${taskIndex + 1}`
                        ).trim();

                    addTask(
                        orderedTasks,
                        seen,
                        courseData,
                        moduleId,
                        moduleTitle,
                        lessonId,
                        taskId,
                        task
                    );
                }
            );
        }
    );
};
