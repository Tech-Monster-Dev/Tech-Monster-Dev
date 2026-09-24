export const applyModuleLocking = (
    data,
    approvedModuleIds
) => {

    if (!data?.modules) {
        return data;
    }

    const modules = data.modules.map(
        (module, moduleIndex) => {

            const canStart =
                moduleIndex === 0 ||
                approvedModuleIds.has(
                    String(data.modules[moduleIndex - 1].id)
                );

            const sections = (
                module.sections || []
            ).map(
                (section, sectionIndex) => {

                    let locked = false;

                    if (!canStart) {

                        locked = true;

                    } else if (sectionIndex > 0) {

                        locked =
                            !module.sections[
                                sectionIndex - 1
                            ].completed;

                    }

                    return {
                        ...section,
                        locked
                    };
                }
            );

            return {
                ...module,
                sections,
                canStart
            };
        }
    );

    return {
        ...data,

        modules,

        lessons: modules.flatMap(
            module => module.sections
        )
    };
};