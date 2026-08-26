import { readFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

import {
    normalizeSlug,
} from "./submission.utils.js";

const __filename =
    fileURLToPath(import.meta.url);

const __dirname =
    path.dirname(__filename);

const contentDataDirs = [
    path.resolve(
        __dirname,
        "../../../../data/course"
    ),
    path.resolve(
        __dirname,
        "../../../../data/internship"
    ),
    path.resolve(
        __dirname,
        "../../data/courses"
    ),
];

export const readCourseData =
    async (courseSlug) => {
        const fileName =
            `${normalizeSlug(courseSlug)}.json`;

        for (
            const contentDir of
            contentDataDirs
        ) {
            try {
                const raw =
                    await readFile(
                        path.join(
                            contentDir,
                            fileName
                        ),
                        "utf8"
                    );

                return JSON.parse(raw);
            } catch {
                // Try next source.
            }
        }

        return null;
    };
