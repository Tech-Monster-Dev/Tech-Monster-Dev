// =========================================
// NORMALIZE SLUG
// =========================================

export const normalizeSlug = (slug) =>
    String(slug || "")
        .trim()
        .toLowerCase()
        .replace(/_/g, "-");


// =========================================
// TASK KEY
// =========================================

export const getTaskKey = (submission) => {
    if (
        !submission?.moduleId ||
        !submission?.taskId
    ) {
        return "";
    }

    const moduleId =
        String(submission.moduleId);

    const lessonId =
        String(submission.lessonId || "").trim();

    const taskId =
        String(submission.taskId);

    return lessonId
        ? [
            moduleId,
            lessonId,
            taskId,
        ].join("_")
        : [
            moduleId,
            taskId,
        ].join("_");
};


// =========================================
// FORMAT COUNTDOWN
// =========================================

export const formatCountdown = (
    expiresAt,
    now = Date.now()
) => {

    if (!expiresAt) {
        return null;
    }

    const expiryTime =
        new Date(expiresAt).getTime();

    if (
        Number.isNaN(expiryTime)
    ) {
        return null;
    }

    const diff =
        expiryTime - now;

    if (diff <= 0) {
        return "00:00:00";
    }

    const totalSeconds =
        Math.floor(
            diff / 1000
        );

    const hours =
        Math.floor(
            totalSeconds / 3600
        );

    const minutes =
        Math.floor(
            (totalSeconds % 3600) / 60
        );

    const seconds =
        totalSeconds % 60;

    return [
        String(hours).padStart(
            2,
            "0"
        ),

        String(minutes).padStart(
            2,
            "0"
        ),

        String(seconds).padStart(
            2,
            "0"
        ),
    ].join(":");
};


// =========================================
// TASK EXPIRES AT
// =========================================

export const getTaskExpiresAt = (deadline) => {
    if (deadline?.expiresAt) {
        return deadline.expiresAt;
    }

    if (!deadline?.unlockedAt) {
        return null;
    }

    const unlockedTime =
        new Date(deadline.unlockedAt).getTime();

    if (Number.isNaN(unlockedTime)) {
        return null;
    }

    return new Date(
        unlockedTime +
        48 * 60 * 60 * 1000
    ).toISOString();
};


// =========================================
// BUILD MODULES
// =========================================

export const buildModules = (contentData) => {
    console.log("contentData:=", contentData);

    if (
        !contentData ||
        !Array.isArray(contentData.modules)
    ) {
        return [];
    }

    return contentData.modules.map(
        (module, moduleIndex) => {

            const moduleId = String(
                module.moduleId ||
                module.id ||
                `module-${moduleIndex + 1}`
            );

            const moduleTitle =
                module.moduleTitle ||
                module.title ||
                `Module ${moduleIndex + 1}`;

            const lessons = [];

            // =====================================
            // MODULE LEVEL TASKS
            // =====================================

            const tasks = Array.isArray(module.tasks)
                ? module.tasks.map((task, taskIndex) => {

                    const taskId = String(
                        task.taskId ||
                        task.id ||
                        `task-${taskIndex + 1}`
                    );

                    const uniqueKey = [
                        moduleId,
                        taskId,
                    ].join("_");

                    return {
                        id: uniqueKey,

                        moduleId,

                        lessonId: "",

                        taskId,

                        title:
                            task.title ||
                            task.taskTitle ||
                            `Task ${taskIndex + 1}`,

                        level:
                            task.level ||
                            task.difficulty ||
                            "Task",

                        description:
                            task.description ||
                            "",

                        problemStatement:
                            task.problemStatement ||
                            task.description ||
                            "",

                        objectives:
                            Array.isArray(task.objectives)
                                ? task.objectives
                                : Array.isArray(task.requirements)
                                    ? task.requirements
                                    : [],

                        requirements:
                            Array.isArray(task.requirements)
                                ? task.requirements
                                : [],

                        hint:
                            task.hint ||
                            "",

                        solutionCode:
                            task.solutionCode ||
                            "",

                        solutionExplanation:
                            task.solutionExplanation ||
                            "",
                    };
                })
                : [];

            // =====================================
            // LESSONS
            // =====================================

            if (
                Array.isArray(module.lessons)
            ) {

                module.lessons.forEach(
                    (lesson, lessonIndex) => {

                        const lessonId = String(
                            lesson.lessonId ||
                            lesson.id ||
                            `lesson-${lessonIndex + 1}`
                        );

                        const lessonTitle =
                            lesson.lessonTitle ||
                            lesson.title ||
                            `Lesson ${lessonIndex + 1}`;

                        if (
                            !Array.isArray(
                                lesson.tasks
                            )
                        ) {
                            return;
                        }

                        const tasks = [];

                        const seenTasks = new Set();

                        lesson.tasks.forEach(
                            (task, taskIndex) => {

                                const taskId = String(
                                    task.taskId ||
                                    task.id ||
                                    `task-${taskIndex + 1}`
                                );

                                // =================================
                                // IMPORTANT
                                // module + lesson + task
                                // =================================

                                const uniqueKey = [
                                    moduleId,
                                    lessonId,
                                    taskId,
                                ].join("_");

                                if (
                                    seenTasks.has(
                                        uniqueKey
                                    )
                                ) {
                                    return;
                                }

                                seenTasks.add(
                                    uniqueKey
                                );

                                tasks.push({

                                    id: uniqueKey,

                                    moduleId,

                                    lessonId,

                                    taskId,

                                    title:
                                        task.title ||
                                        task.taskTitle ||
                                        `Task ${taskIndex + 1}`,

                                    level:
                                        task.difficulty ||
                                        task.level ||
                                        "Task",

                                    description:
                                        task.description ||
                                        "",

                                    problemStatement:
                                        task.problemStatement ||
                                        task.description ||
                                        "",

                                    requirements:
                                        Array.isArray(task.requirements)
                                            ? task.requirements
                                            : [],

                                    objectives:
                                        Array.isArray(task.objectives)
                                            ? task.objectives
                                            : Array.isArray(task.requirements)
                                                ? task.requirements
                                                : [],

                                    hint:
                                        task.hint ||
                                        "",

                                    solutionCode:
                                        task.solutionCode ||
                                        "",
                                });
                            }
                        );

                        if (tasks.length) {

                            lessons.push({

                                id:
                                    `${moduleId}_${lessonId}`,

                                lessonId,

                                title:
                                    lessonTitle,

                                tasks,
                            });
                        }
                    }
                );
            }


            // =====================================
            // ALL TASKS
            // =====================================
            return {
                id: moduleId,
                title: moduleTitle,
                lessons,
                tasks,
            };
        }
    );
};


// =========================================
// GET CONTENT FROM API RESPONSE
// =========================================

export const getContentFromResponse = (
    response
) => {

    const data =
        response?.data || {};

    const contentKey =
        Object.keys(data).find(
            (key) =>
                key !== "success" &&
                key !== "message" &&
                !Array.isArray(
                    data[key]
                ) &&
                data[key] &&
                typeof data[key] ===
                "object"
        );

    return contentKey
        ? data[contentKey]
        : data;
};
