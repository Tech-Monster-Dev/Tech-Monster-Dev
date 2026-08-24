export const normalizeLessonData = (learningData) => {

    if (!learningData?.modules) {
        return {
            title: learningData?.title || "Course",
            category: learningData?.category || "",
            modules: [],
            lessons: []
        };
    }

    const modules = learningData.modules.map(
        (module, moduleIndex) => {

            const sections = (module.lessons || []).map(
                (lesson, lessonIndex) => {

                    const notes = lesson.notes || {};

                    return {
                        id:
                            lesson.lessonId ||
                            `${moduleIndex + 1}-${lessonIndex + 1}`,

                        title:
                            lesson.lessonTitle ||
                            `Lesson ${lessonIndex + 1}`,

                        heading:
                            notes.heading ||
                            lesson.lessonTitle ||
                            `Lesson ${lessonIndex + 1}`,

                        paragraph:
                            notes.overview ||
                            notes.paragraph ||
                            "",

                        completed: false,

                        locked: false,

                        bookmarked: false,

                        lesson,

                        tasks:
                            lesson.tasks || [],

                        moduleTitle:
                            module.moduleTitle ||
                            `Module ${moduleIndex + 1}`
                    };
                }
            );

            return {
                id:
                    module.moduleId ||
                    `module-${moduleIndex + 1}`,

                title:
                    module.moduleTitle ||
                    `Module ${moduleIndex + 1}`,

                length: sections.length,

                sections
            };
        }
    );

    return {
        ...learningData,

        title: learningData.title || "Course",

        category: learningData.category || "",

        modules,

        lessons: modules.flatMap(
            module => module.sections
        )
    };
};