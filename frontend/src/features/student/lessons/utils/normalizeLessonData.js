export const normalizeLessonData = (learningData) => {
    if (!learningData) {
        return {};
    }

    const sourceModules = Array.isArray(learningData.modules)
        ? learningData.modules
        : [];

    const modules = sourceModules.map(
        (module, moduleIndex) => {

            const sourceLessons = Array.isArray(module.lessons)
                ? module.lessons
                : [];

            const sections = sourceLessons.map(
                (lesson, lessonIndex) => {

                    const notes = Array.isArray(lesson.notes)
                        ? lesson.notes
                        : [];

                    const firstHeading =
                        notes.find(
                            (note) =>
                                note?.type === "heading" &&
                                note?.text
                        )?.text ||
                        lesson.title ||
                        `Lesson ${lessonIndex + 1}`;

                    const firstParagraph =
                        notes.find(
                            (note) =>
                                note?.type === "paragraph" &&
                                note?.text
                        )?.text ||
                        lesson.description ||
                        "";

                    return {
                        id:
                            lesson.id ||
                            `${moduleIndex + 1}-${lessonIndex + 1}`,

                        title:
                            lesson.title ||
                            `Lesson ${lessonIndex + 1}`,

                        heading: firstHeading,

                        paragraph: firstParagraph,

                        completed: false,

                        locked: false,

                        bookmarked: false,

                        lesson,

                        notes,

                        tasks: Array.isArray(lesson.tasks)
                            ? lesson.tasks
                            : [],

                        practicals:
                            Array.isArray(lesson.practicals)
                                ? lesson.practicals
                                : [],

                        moduleTitle:
                            module.title ||
                            `Module ${moduleIndex + 1}`,
                    };
                }
            );

            return {
                id:
                    module.id ||
                    `module-${moduleIndex + 1}`,

                title:
                    module.title ||
                    `Module ${moduleIndex + 1}`,

                description:
                    module.description || "",

                length: sections.length,

                sections,

                tasks: Array.isArray(module.tasks)
                    ? module.tasks
                    : [],
            };
        }
    );

    return {
        ...learningData,

        id:
            learningData.id || "",

        title:
            learningData.title || "Course",

        category:
            learningData.category || "",

        description:
            learningData.description || "",

        modules,

        lessons: modules.flatMap(
            (module) => module.sections
        ),
    };
};
