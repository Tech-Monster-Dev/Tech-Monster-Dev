import { readdir, readFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

import {
    normalizeSlug,
} from "./submission.utils.js";

const __filename =
    fileURLToPath(import.meta.url);

const __dirname =
    path.dirname(__filename);

const dataRoots = [
    {
        directory: path.resolve(__dirname, "../../../../data/Courses"),
        key: "course",
        file: "course.json",
    },
    {
        directory: path.resolve(__dirname, "../../../../data/courses"),
        key: "course",
        file: "course.json",
    },
    {
        directory: path.resolve(__dirname, "../../../../data/Internships"),
        key: "internship",
        file: "internship.json",
    },
    {
        directory: path.resolve(__dirname, "../../../../data/internships"),
        key: "internship",
        file: "internship.json",
    },
];

export const readCourseData =
    async (courseSlug) => {
        if (!courseSlug) {
            return null;
        }

        try {
            const normalizedTarget =
                normalizeSlug(courseSlug);

            for (const root of dataRoots) {
                let folders;

                try {
                    folders = await readdir(
                        root.directory,
                        { withFileTypes: true }
                    );
                } catch {
                    continue;
                }

                for (const folder of folders) {
                    if (!folder.isDirectory()) {
                        continue;
                    }

                    const filePath =
                        path.join(
                            root.directory,
                            folder.name,
                            root.file
                        );

                    try {
                        const raw =
                            await readFile(
                                filePath,
                                "utf8"
                            );

                        const parsed =
                            JSON.parse(raw);

                        const courseData =
                            parsed?.[root.key] ||
                            parsed;

                        if (
                            normalizeSlug(
                                courseData?.slug
                            ) === normalizedTarget
                        ) {
                            return courseData;
                        }
                    } catch {
                        continue;
                    }
                }
            }
        } catch {
            return null;
        }

        return null;
    };
