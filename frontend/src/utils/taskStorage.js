// ==============================================
// Task completion persistence helper
// Stores task status per USER + COURSE.
// ==============================================


// ==============================================
// Normalize value
// ==============================================

const normalizeValue = (value = "") => {

    return String(value)
        .trim()
        .toLowerCase()
        .replace(/_/g, "-");

};


// ==============================================
// Get user-specific storage key
// ==============================================

export const getTaskStorageKey = (
    userId,
    courseSlug
) => {

    const normalizedUserId =
        normalizeValue(userId || "guest");

    const normalizedCourseSlug =
        normalizeValue(courseSlug);

    return `task_completion_${normalizedUserId}_${normalizedCourseSlug}`;

};


// ==============================================
// Load task state
// ==============================================

export const loadTaskState = (
    userId,
    courseSlug
) => {

    try {

        const key =
            getTaskStorageKey(
                userId,
                courseSlug
            );

        const raw =
            localStorage.getItem(key);

        return raw
            ? JSON.parse(raw)
            : {};

    } catch (error) {

        console.error(
            "Failed to load task state:",
            error
        );

        return {};

    }

};


// ==============================================
// Save task state
// ==============================================

export const saveTaskState = (
    userId,
    courseSlug,
    state
) => {

    try {

        const key =
            getTaskStorageKey(
                userId,
                courseSlug
            );

        localStorage.setItem(
            key,
            JSON.stringify(state)
        );

    } catch (error) {

        console.error(
            "Failed to save task state:",
            error
        );

    }

};


// ==============================================
// Clear task state
// ==============================================

export const clearTaskState = (
    userId,
    courseSlug
) => {

    try {

        const key =
            getTaskStorageKey(
                userId,
                courseSlug
            );

        localStorage.removeItem(key);

    } catch (error) {

        console.error(
            "Failed to clear task state:",
            error
        );

    }

};


// ==============================================
// Check whether all tasks are approved
// ==============================================

export const isAllTasksApproved = (
    userId,
    courseSlug,
    taskIds
) => {

    if (
        !Array.isArray(taskIds) ||
        taskIds.length === 0
    ) {

        return false;

    }


    const state = loadTaskState(
        userId,
        courseSlug
    );


    return taskIds.every(
        (id) =>
            state[id] === "approved"
    );

};


// ==============================================
// Clear ALL task storage for a user
// Optional helper
// ==============================================

export const clearAllUserTaskState = (
    userId
) => {

    try {

        const prefix =
            `task_completion_${normalizeValue(userId)}_`;

        const keysToRemove = [];


        for (
            let index = 0;
            index < localStorage.length;
            index++
        ) {

            const key =
                localStorage.key(index);

            if (
                key &&
                key.startsWith(prefix)
            ) {

                keysToRemove.push(key);

            }

        }


        keysToRemove.forEach(
            (key) => {
                localStorage.removeItem(key);
            }
        );

    } catch (error) {

        console.error(
            "Failed to clear user task states:",
            error
        );

    }

};