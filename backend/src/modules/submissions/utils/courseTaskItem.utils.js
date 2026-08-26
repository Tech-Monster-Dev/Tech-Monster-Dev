import {
    normalizeSlug,
} from "./submission.utils.js";

export const addTask = (
    orderedTasks,
    seen,
    courseData,
    moduleId,
    moduleTitle,
    lessonId,
    taskId,
    task
) => {
    const taskKey = [
        moduleId,
        lessonId,
        taskId,
    ].join("_");

    if (seen.has(taskKey)) {
        return;
    }

    seen.add(taskKey);

    orderedTasks.push({
        courseSlug:
            normalizeSlug(
                courseData.slug ||
                courseData.courseSlug ||
                ""
            ),

        moduleId,
        moduleTitle,
        lessonId,
        taskId,

        taskTitle:
            task.title ||
            task.taskTitle ||
            "Task",

        problemStatement:
            task.problemStatement ||
            "",
    });
};
