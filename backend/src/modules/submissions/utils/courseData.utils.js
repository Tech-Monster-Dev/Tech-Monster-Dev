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

const coursesDir =
    path.resolve(
        __dirname,
        "../../../../data/courses"
    );

const internshipsDir =
    path.resolve(
        __dirname,
        "../../../../data/internships"
    );

export const readCourseData =
    async (courseSlug) => {
        if (!courseSlug) {
            return null;
        }

        try {
            const folders =
                await readdir(
                    coursesDir,
                    {
                        withFileTypes: true,
                    }
                );

            const normalizedTarget =
                normalizeSlug(courseSlug);

            for (const folder of folders) {
                if (!folder.isDirectory()) {
                    continue;
                }

                const filePath =
                    path.join(
                        coursesDir,
                        folder.name,
                        "course.json"
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
                        parsed?.course ||
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
        } catch {
            return null;
        }

        return null;
    };
