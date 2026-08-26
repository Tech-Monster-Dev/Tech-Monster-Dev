const isModuleApproved = (module, taskStatusMap) => {
    const tasks = module.tasks || [];
    return tasks.length > 0 &&
        tasks.every((task) => taskStatusMap[task.id] === "approved");
};

const findRequestedModule = (modules, moduleId, taskStatusMap) => {
    if (!moduleId) return null;

    const index = modules.findIndex(
        (module) => String(module.id) === moduleId
    );

    if (index === 0) return modules[index];
    if (index < 1) return null;

    const previousModules = modules.slice(0, index);
    const completed = previousModules.every((module) =>
        isModuleApproved(module, taskStatusMap)
    );

    return completed ? modules[index] : null;
};

const findAvailableModule = (modules, taskStatusMap) => {
    let availableIndex = 0;

    for (let index = 0; index < modules.length; index++) {
        const module = modules[index];
        const tasks = module.tasks || [];

        if (!tasks.length) continue;

        if (!isModuleApproved(module, taskStatusMap)) {
            availableIndex = index;
            break;
        }

        availableIndex = Math.min(index + 1, modules.length - 1);
    }

    return modules[availableIndex] || null;
};

export const getScopedTaskModule = (
    modules,
    taskStatusMap,
    moduleId
) => {
    if (!modules.length) return null;

    return (
        findRequestedModule(modules, moduleId, taskStatusMap) ||
        findAvailableModule(modules, taskStatusMap)
    );
};

export const buildScopedTaskModule = (module) => {
    if (!module) return null;

    const lessons = (module.lessons || [])
        .map((lesson) => ({
            ...lesson,
            tasks: [...(lesson.tasks || [])],
        }))
        .filter((lesson) => lesson.tasks.length > 0);

    return {
        ...module,
        lessons,
        tasks: [...(module.tasks || [])],
    };
};
