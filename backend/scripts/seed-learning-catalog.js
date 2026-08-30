import dotenv from "dotenv";
import mongoose from "mongoose";
import { readdir, readFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

import Course from "../src/modules/courses/models/Course.js";
import Internship from "../src/modules/internships/models/Internship.js";

dotenv.config({ path: path.resolve(process.cwd(), ".env"), quiet: true });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const coursesDir = path.resolve(__dirname, "../data/courses");
const internshipsDir = path.resolve(__dirname, "../data/internships");

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

const countLearningData = (modules = []) => {
    const lessons = modules.flatMap(
        (module) => Array.isArray(module.lessons) ? module.lessons : []
    );

    const tasks = lessons.flatMap(
        (lesson) => Array.isArray(lesson.tasks) ? lesson.tasks : []
    );

    const notes = lessons.flatMap(
        (lesson) => Array.isArray(lesson.notes) ? lesson.notes : []
    );

    return {
        totalTasks: tasks.length,
        totalNotes: notes.length
    };
};

const readProgramFiles = async (rootDir, fileName, key) => {
    const folders = await readdir(rootDir, {
        withFileTypes: true
    });

    const programs = [];

    for (const folder of folders) {
        if (!folder.isDirectory()) {
            continue;
        }

        const filePath = path.join(
            rootDir,
            folder.name,
            fileName
        );

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

            programs.push({
                folder: folder.name,
                program
            });
        } catch (error) {
            throw new Error(
                `${filePath}: ${error.message}`
            );
        }
    }

    return programs;
};

const buildCatalogData = (program) => {
    const modules = Array.isArray(program.modules)
        ? program.modules
        : [];

    const { totalTasks, totalNotes } =
        countLearningData(modules);

    return {
        title: program.title || "",
        slug: String(program.slug).trim().toLowerCase().replace(/_/g, "-"),
        category: Array.isArray(program.technology) ? (program.technology[0] || "General") : (program.technology?.name || "General"),
        level: normalizeLevel(program.level),
        description: program.description || "",
        thumbnail: "",
        duration: program.duration || program.estimatedDuration || "",
        price: 0,
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
        const data = buildCatalogData(program);

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
            await Model.create(data);

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
                coursesDir,
                "course.json",
                "course"
            );

        const internships =
            await readProgramFiles(
                internshipsDir,
                "internship.json",
                "internship"
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
