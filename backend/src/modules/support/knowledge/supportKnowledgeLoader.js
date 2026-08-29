import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_ROOT = path.resolve(
    __dirname,
    "../../../../data"
);

const SOURCE_DIRECTORIES = [
    {
        type: "course",
        directory: "course"
    },
    {
        type: "internship",
        directory: "internship"
    },
    {
        type: "support",
        directory: "support"
    }
];

const readJsonFile = async (filePath) => {
    const content = await fs.readFile(
        filePath,
        "utf-8"
    );

    return JSON.parse(content);
};

const loadSourceFiles = async (
    type,
    directory
) => {
    const directoryPath = path.join(
        DATA_ROOT,
        directory
    );

    const files = await fs.readdir(
        directoryPath,
        {
            withFileTypes: true
        }
    );

    const jsonFiles = files
        .filter(
            (file) =>
                file.isFile() &&
                file.name.endsWith(".json")
        )
        .sort((a, b) =>
            a.name.localeCompare(b.name)
        );

    const sources = [];

    for (const file of jsonFiles) {
        const filePath = path.join(
            directoryPath,
            file.name
        );

        const data =
            await readJsonFile(filePath);

        sources.push({
            type,
            file: file.name,
            data
        });
    }

    return sources;
};

export const loadSupportKnowledgeSources =
    async () => {
        const sources = [];

        for (const sourceDirectory of SOURCE_DIRECTORIES) {
            const loaded =
                await loadSourceFiles(
                    sourceDirectory.type,
                    sourceDirectory.directory
                );

            sources.push(...loaded);
        }

        return sources;
    };

export const getSupportKnowledgeStats =
    async () => {
        const sources =
            await loadSupportKnowledgeSources();

        return sources.map((source) => {
            const modules =
                Array.isArray(
                    source.data?.modules
                )
                    ? source.data.modules
                    : [];

            const lessons =
                modules.flatMap(
                    (module) =>
                        Array.isArray(
                            module?.lessons
                        )
                            ? module.lessons
                            : []
                );

            const tasks =
                lessons.flatMap(
                    (lesson) =>
                        Array.isArray(
                            lesson?.tasks
                        )
                            ? lesson.tasks
                            : []
                );

            const entries =
                Array.isArray(
                    source.data?.entries
                )
                    ? source.data.entries
                    : [];

            return {
                type: source.type,
                file: source.file,
                slug: source.data?.slug || "",
                title: source.data?.title || "",
                category:
                    source.data?.category || "",
                modules: modules.length,
                lessons: lessons.length,
                tasks: tasks.length,
                entries: entries.length
            };
        });
    };
