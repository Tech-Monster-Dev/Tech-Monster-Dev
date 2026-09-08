import dotenv from "dotenv";
import mongoose from "mongoose";
import { access, readdir, readFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

import Course from "../src/modules/courses/models/Course.js";
import Internship from "../src/modules/internships/models/Internship.js";

dotenv.config({ path: path.resolve(process.cwd(), ".env"), quiet: true });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataRoots = [
    {
        directories: [
            path.resolve(__dirname, "../data/Courses"),
            path.resolve(__dirname, "../data/courses"),
        ],
        fileName: "course.json",
        key: "course",
        label: "course",
    },
    {
        directories: [
            path.resolve(__dirname, "../data/Internships"),
            path.resolve(__dirname, "../data/internships"),
        ],
        fileName: "internship.json",
        key: "internship",
        label: "internship",
    },
];

const normalizeLevel = (level) => {
    const value = String(level || "").trim().toLowerCase();

    if (value.includes("advanced")) {
        return "Advanced";
    }

    if (value.includes("intermediate")) {
        return "Intermediate";
    }

    return "Beginner";
};

const fileExists = async (filePath) => {
    try {
        await access(filePath);
        return true;
    } catch {
        return false;
    }
};

const countLearningData = (modules = []) => {
    const lessons = modules.flatMap(
        (module) => Array.isArray(module.lessons) ? module.lessons : []
    );

    const tasks = modules.flatMap((module) => [
        ...(Array.isArray(module.tasks) ? module.tasks : []),
        ...lessons
            .filter((lesson) => module.lessons?.includes(lesson))
            .flatMap((lesson) => Array.isArray(lesson.tasks) ? lesson.tasks : []),
    ]);

    const notes = lessons.flatMap(
        (lesson) => Array.isArray(lesson.notes) ? lesson.notes : []
    );

    return {
        totalTasks: tasks.length,
        totalNotes: notes.length
    };
};

const readProgramFiles = async (rootDir, fileName, key) => {
    const programsBySlug = new Map();

    const visitDirectory = async (directory) => {
        const folders = await readdir(directory, {
            withFileTypes: true
        });

        for (const folder of folders) {
            if (!folder.isDirectory()) {
                continue;
            }

            const programDirectory = path.join(
                directory,
                folder.name
            );

            const filePath = path.join(
                programDirectory,
                fileName
            );

            if (!await fileExists(filePath)) {
                await visitDirectory(programDirectory);
                continue;
            }

            try {
                const raw = await readFile(
                    filePath,
                    "utf8"
                );

                const parsed = JSON.parse(raw);
                const program = parsed?.[key] || parsed;

                if (!program?.slug) {
                    throw new Error("Missing slug");
                }

                const slug = normalizeSlug(program.slug);

                if (!programsBySlug.has(slug)) {
                    programsBySlug.set(slug, {
                        folder: path.relative(directory, programDirectory),
                        program
                    });
                }
            } catch (error) {
                throw new Error(
                    `${filePath}: ${error.message}`
                );
            }
        }
    };

    for (const directory of rootDir) {
        try {
            await visitDirectory(directory);
        } catch (error) {
            throw new Error(
                `${directory}: ${error.message}`
            );
        }
    }

    return [...programsBySlug.values()];
};

const normalizeSlug = (slug) =>
    String(slug || "")
        .trim()
        .toLowerCase()
        .replace(/_/g, "-");

const toModelString = (value) => {
    if (value === null || value === undefined) {
        return "";
    }

    return typeof value === "string"
        ? value
        : typeof value === "object"
            ? JSON.stringify(value)
            : String(value);
};

const buildCatalogData = (program, type) => {
    const modules = Array.isArray(program.modules)
        ? program.modules
        : [];

    const { totalTasks, totalNotes } =
        countLearningData(modules);

    return {
        title: program.title || "",
        slug: normalizeSlug(program.slug),
        category: type === "internship"
            ? program.domain || "General"
            : "General",
        level: normalizeLevel(program.level),
        description: program.description ||
            (Array.isArray(program.objectives)
                ? program.objectives.join(" ")
                : ""),
        duration: toModelString(program.duration || program.estimatedDuration),
        totalTasks,
        totalNotes,
        certificate: true,
        badge: true,
        isPublished: true
    };
};

const upsertPrograms = async ({
    Model,
    programs,
    label
}) => {
    let created = 0;
    let updated = 0;

    for (const { folder, program } of programs) {
        const data = buildCatalogData(program, label.toLowerCase());

        const existing = await Model.findOne({
            slug: data.slug
        });

        if (existing) {
            await Model.updateOne(
                { _id: existing._id },
                { $set: data }
            );

            updated++;
            console.log(
                `UPDATED ${label}: ${folder} -> ${data.slug}`
            );
        } else {
            await Model.create({
                ...data,
                thumbnail: "",
                price: 0,
            });

            created++;
            console.log(
                `CREATED ${label}: ${folder} -> ${data.slug}`
            );
        }
    }

    return {
        created,
        updated
    };
};

const main = async () => {
    try {
        await mongoose.connect(
            process.env.MONGODB_URI
        );

        console.log(
            `MongoDB Connected: ${mongoose.connection.host}`
        );

        const courses =
            await readProgramFiles(
                dataRoots[0].directories,
                dataRoots[0].fileName,
                dataRoots[0].key
            );

        const internships =
            await readProgramFiles(
                dataRoots[1].directories,
                dataRoots[1].fileName,
                dataRoots[1].key
            );

        console.log(
            `Found ${courses.length} course JSON files`
        );

        console.log(
            `Found ${internships.length} internship JSON files`
        );

        const courseResult =
            await upsertPrograms({
                Model: Course,
                programs: courses,
                label: "COURSE"
            });

        const internshipResult =
            await upsertPrograms({
                Model: Internship,
                programs: internships,
                label: "INTERNSHIP"
            });

        console.log("\n===== SEED SUMMARY =====");

        console.log(
            `Courses  : created=${courseResult.created}, updated=${courseResult.updated}`
        );

        console.log(
            `Internships: created=${internshipResult.created}, updated=${internshipResult.updated}`
        );

        console.log(
            `MongoDB Courses     : ${await Course.countDocuments()}`
        );

        console.log(
            `MongoDB Internships : ${await Internship.countDocuments()}`
        );

        console.log(
            `StudentInternships  : ${await mongoose.connection.db.collection("studentinternships").countDocuments()}`
        );

        console.log("\nSeed completed successfully.");
    } catch (error) {
        console.error("\nSeed failed:");
        console.error(error);
        process.exitCode = 1;
    } finally {
        await mongoose.connection.close();
    }
};

main();
