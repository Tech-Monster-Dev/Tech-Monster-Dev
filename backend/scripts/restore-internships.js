import dotenv from "dotenv";
import mongoose from "mongoose";
import { BSON } from "mongodb";
import { mkdir, readFile, readdir, writeFile } from "fs/promises";
import { createHash } from "crypto";
import os from "os";
import path from "path";
import { fileURLToPath } from "url";

import Internship from "../src/modules/internships/models/Internship.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendDir = path.resolve(__dirname, "..");
const dataDir = path.resolve(backendDir, "data", "Internships");

dotenv.config({
    path: path.resolve(backendDir, ".env"),
    quiet: true,
});

const args = process.argv.slice(2);
const valueFor = (name) => {
    const index = args.indexOf(name);
    return index >= 0 ? args[index + 1] : undefined;
};
const hasFlag = (name) => args.includes(name);
const apply = hasFlag("--apply");
const expectedCount = valueFor("--expect-count");
const confirmedDatabase = valueFor("--confirm-database");
const backupDirectory = path.resolve(
    valueFor("--backup-dir") || path.join(os.homedir(), "TechMonsterBackups")
);
const knownFlags = new Set([
    "--apply",
    "--dry-run",
    "--confirm-non-production",
    "--allow-remote",
]);
const knownValues = new Set([
    "--expect-count",
    "--confirm-database",
    "--backup-dir",
]);

for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (knownFlags.has(arg)) continue;
    if (knownValues.has(arg)) {
        if (!args[index + 1] || args[index + 1].startsWith("--")) {
            throw new Error(`${arg} requires a value.`);
        }
        index += 1;
        continue;
    }
    throw new Error(`Unknown option: ${arg}`);
}

if (hasFlag("--apply") && hasFlag("--dry-run")) {
    throw new Error("Choose either --apply or --dry-run, not both.");
}

if (apply) {
    if (!confirmedDatabase) {
        throw new Error("--apply requires --confirm-database <database-name>.");
    }
    if (!hasFlag("--confirm-non-production")) {
        throw new Error("--apply requires --confirm-non-production.");
    }
    if (expectedCount === undefined || !/^\d+$/.test(expectedCount)) {
        throw new Error("--apply requires --expect-count <current-document-count>.");
    }
}

const normalizeSlug = (slug) =>
    String(slug || "")
        .trim()
        .toLowerCase()
        .replace(/_/g, "-");

const normalizeLevel = (level) => {
    const value = String(level || "").trim().toLowerCase();

    if (value.includes("advanced")) return "Advanced";
    if (value.includes("intermediate")) return "Intermediate";
    return "Beginner";
};

const toModelString = (value) => {
    if (value === null || value === undefined) return "";
    if (typeof value === "string") return value;
    if (typeof value === "object") return JSON.stringify(value);
    return String(value);
};

const countLearningData = (modules = []) => {
    const lessons = modules.flatMap((module) =>
        Array.isArray(module.lessons) ? module.lessons : []
    );
    const tasks = modules.flatMap((module) => {
        const moduleLessons = Array.isArray(module.lessons)
            ? module.lessons
            : [];
        return [
            ...(Array.isArray(module.tasks) ? module.tasks : []),
            ...moduleLessons.flatMap((lesson) =>
                Array.isArray(lesson.tasks) ? lesson.tasks : []
            ),
        ];
    });
    const notes = lessons.flatMap((lesson) =>
        Array.isArray(lesson.notes) ? lesson.notes : []
    );

    return {
        totalTasks: tasks.length,
        totalNotes: notes.length,
    };
};

const readPrograms = async () => {
    const folders = await readdir(dataDir, { withFileTypes: true });
    const programs = [];

    for (const folder of folders
        .filter((entry) => entry.isDirectory())
        .sort((left, right) => left.name.localeCompare(right.name))) {
        const filePath = path.join(dataDir, folder.name, "internship.json");
        let parsed;

        try {
            parsed = JSON.parse(await readFile(filePath, "utf8"));
        } catch (error) {
            throw new Error(`${filePath}: ${error.message}`);
        }

        const program = parsed?.internship || parsed;
        if (!program?.slug) {
            throw new Error(`${filePath}: missing internship slug.`);
        }

        const modules = Array.isArray(program.modules) ? program.modules : [];
        const { totalTasks, totalNotes } = countLearningData(modules);
        const data = {
            title: program.title || "",
            slug: normalizeSlug(program.slug),
            category: program.domain || "General",
            level: normalizeLevel(program.level),
            description:
                program.description ||
                (Array.isArray(program.objectives)
                    ? program.objectives.join(" ")
                    : ""),
            duration: toModelString(program.duration || program.estimatedDuration),
            totalTasks,
            totalNotes,
            certificate: true,
            badge: true,
            isPublished: true,
            thumbnail: "",
            price: 0,
        };

        try {
            await new Internship(data).validate();
        } catch (validationError) {
            if (!(validationError instanceof mongoose.Error.ValidationError)) {
                throw validationError;
            }
            const details = Object.values(validationError.errors)
                .map((item) => `${item.path}: ${item.message}`)
                .join("; ");
            throw new Error(`${filePath}: schema validation failed: ${details}`);
        }

        programs.push(data);
    }

    const slugs = programs.map((program) => program.slug);
    const duplicates = slugs.filter((slug, index) => slugs.indexOf(slug) !== index);
    if (duplicates.length > 0) {
        throw new Error(
            `Duplicate source slugs: ${[...new Set(duplicates)].join(", ")}`
        );
    }

    return programs;
};

const getDuplicateSlugs = async (collection) =>
    collection
        .aggregate([
            {
                $group: {
                    _id: "$slug",
                    count: { $sum: 1 },
                },
            },
            { $match: { count: { $gt: 1 } } },
            { $project: { _id: 1, count: 1 } },
        ])
        .toArray();

const createCollectionBackup = async (db, collectionName, documents) => {
    await mkdir(backupDirectory, { recursive: true });
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupPath = path.join(
        backupDirectory,
        `internships-${db.databaseName}-${timestamp}.ejson`
    );
    const payload = {
        database: db.databaseName,
        collection: collectionName,
        backedUpAt: new Date().toISOString(),
        documents,
    };
    const serialized = BSON.EJSON.stringify(payload, null, 2, {
        relaxed: false,
    });

    await writeFile(backupPath, serialized, {
        encoding: "utf8",
        flag: "wx",
    });

    const savedText = await readFile(backupPath, "utf8");
    const saved = BSON.EJSON.parse(savedText, {
        relaxed: false,
    });
    if (
        saved.database !== db.databaseName ||
        saved.collection !== collectionName ||
        !Array.isArray(saved.documents) ||
        saved.documents.length !== documents.length ||
        createHash("sha256").update(savedText).digest("hex") !==
            createHash("sha256").update(serialized).digest("hex")
    ) {
        throw new Error("Collection backup verification failed; no database writes were made.");
    }

    return backupPath;
};

const validateDatabaseDocuments = async () => {
    const documents = await Internship.find().lean();
    const invalid = [];
    const typeErrors = [];
    const stringFields = [
        "title",
        "slug",
        "category",
        "level",
        "description",
        "thumbnail",
        "duration",
    ];
    const numberFields = ["price", "totalTasks", "totalNotes"];
    const booleanFields = ["certificate", "badge", "isPublished"];

    for (const data of documents) {
        for (const field of stringFields) {
            if (typeof data[field] !== "string") {
                typeErrors.push(`${data.slug || "(missing)"}: ${field} is not a string`);
            }
        }
        for (const field of numberFields) {
            if (typeof data[field] !== "number" || !Number.isFinite(data[field])) {
                typeErrors.push(`${data.slug || "(missing)"}: ${field} is not a finite number`);
            }
        }
        for (const field of booleanFields) {
            if (typeof data[field] !== "boolean") {
                typeErrors.push(`${data.slug || "(missing)"}: ${field} is not a boolean`);
            }
        }
        if (!(data.createdAt instanceof Date) || !(data.updatedAt instanceof Date)) {
            typeErrors.push(`${data.slug || "(missing)"}: timestamps are not dates`);
        }

        try {
            await new Internship(data).validate();
        } catch (validationError) {
            if (!(validationError instanceof mongoose.Error.ValidationError)) {
                throw validationError;
            }
            invalid.push({
                slug: data.slug || "(missing)",
                errors: Object.values(validationError.errors).map(
                    (item) => `${item.path}: ${item.message}`
                ),
            });
        }
    }

    return { documents, invalid, typeErrors };
};

const main = async () => {
    const programs = await readPrograms();
    if (!process.env.MONGODB_URI) {
        throw new Error("MONGODB_URI is not configured in backend/.env.");
    }

    let targetIsRemote = false;
    try {
        const targetUrl = new URL(process.env.MONGODB_URI);
        targetIsRemote = !["localhost", "127.0.0.1", "::1"].includes(
            targetUrl.hostname.toLowerCase()
        );
    } catch {
        throw new Error("MONGODB_URI is invalid; connection details are withheld.");
    }

    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 10000,
        });
    } catch {
        throw new Error("MongoDB connection failed; connection details are withheld.");
    }

    try {
        const db = mongoose.connection.db;
        const collectionName = Internship.collection.collectionName;
        const collection = db.collection(collectionName);
        const currentCount = await Internship.countDocuments();

        if (apply) {
            if (db.databaseName !== confirmedDatabase) {
                throw new Error(
                    `Target database mismatch: expected "${confirmedDatabase}", connected database is "${db.databaseName}".`
                );
            }
            if (targetIsRemote && !hasFlag("--allow-remote")) {
                throw new Error("Remote database writes require --allow-remote.");
            }
            if (process.env.NODE_ENV?.toLowerCase() === "production") {
                throw new Error("Refusing to write while NODE_ENV=production.");
            }
            if (/\b(prod|production|live)\b/i.test(db.databaseName)) {
                throw new Error(
                    `Refusing to write to a production-like database name: "${db.databaseName}".`
                );
            }
            if (currentCount !== Number(expectedCount)) {
                throw new Error(
                    `Current collection count is ${currentCount}; expected ${expectedCount}. No backup or writes were made.`
                );
            }
        }

        const duplicateSlugs = await getDuplicateSlugs(collection);
        if (duplicateSlugs.length > 0) {
            throw new Error(
                `Target collection already contains duplicate slugs: ${duplicateSlugs
                    .map((item) => item._id || "(missing)")
                    .join(", ")}`
            );
        }

        const existing = await Internship.find(
            { slug: { $in: programs.map((program) => program.slug) } },
            "slug"
        ).lean();
        const existingSlugs = new Set(existing.map((document) => document.slug));
        const insertions = programs.filter(
            (program) => !existingSlugs.has(program.slug)
        );
        const skipped = programs.filter((program) =>
            existingSlugs.has(program.slug)
        );

        console.log(`Database: ${db.databaseName}`);
        console.log(`Collection: ${collectionName}`);
        console.log(`Connection target: ${targetIsRemote ? "remote" : "local"}`);
        console.log(`Current collection count: ${currentCount}`);
        console.log(`Recovered source records: ${programs.length}`);
        console.log(`Would insert: ${insertions.length}`);
        console.log(`Would skip (slug already exists): ${skipped.length}`);
        console.log("Would update: 0 (existing records are never overwritten)");
        console.log(
            JSON.stringify(
                programs.map((program) => ({
                    action: existingSlugs.has(program.slug) ? "skip-existing" : "insert",
                    title: program.title,
                    slug: program.slug,
                    duration: program.duration,
                    price: program.price,
                    thumbnail: program.thumbnail,
                    totalTasks: program.totalTasks,
                    totalNotes: program.totalNotes,
                })),
                null,
                2
            )
        );

        if (!apply) {
            console.log("Dry run complete; no backup or database writes were made.");
            return;
        }

        const existingDocuments = await collection.find({}).toArray();
        if (existingDocuments.length !== Number(expectedCount)) {
            throw new Error(
                `Collection changed before backup: found ${existingDocuments.length} documents; expected ${expectedCount}. No writes were made.`
            );
        }
        const backupPath = await createCollectionBackup(
            db,
            collectionName,
            existingDocuments
        );
        console.log(`Verified collection backup: ${backupPath}`);

        let inserted = 0;
        let skippedDuringWrite = 0;
        for (const program of programs) {
            const result = await Internship.updateOne(
                { slug: program.slug },
                { $setOnInsert: program },
                {
                    upsert: true,
                    runValidators: true,
                    setDefaultsOnInsert: true,
                }
            );

            if (result.upsertedCount === 1) {
                inserted += 1;
            } else if (result.matchedCount === 1) {
                skippedDuringWrite += 1;
            } else {
                throw new Error(
                    `Unexpected write result for slug "${program.slug}".`
                );
            }
        }

        const { documents, invalid, typeErrors } =
            await validateDatabaseDocuments();
        const finalDuplicates = await getDuplicateSlugs(collection);
        const restored = await Internship.find(
            { slug: { $in: programs.map((program) => program.slug) } },
            "title slug duration price thumbnail isPublished"
        )
            .sort({ slug: 1 })
            .lean();

        if (invalid.length > 0 || typeErrors.length > 0 || finalDuplicates.length > 0) {
            throw new Error(
                `Post-restore validation failed: invalidDocuments=${invalid.length}, typeErrors=${typeErrors.length}, duplicateSlugs=${finalDuplicates.length}. Backup: ${backupPath}`
            );
        }

        console.log("\nRESTORE SUMMARY");
        console.log(`Found in source: ${programs.length}`);
        console.log(`Inserted: ${inserted}`);
        console.log(`Updated: 0`);
        console.log(`Skipped: ${skippedDuringWrite}`);
        console.log(`Total internship records: ${documents.length}`);
        console.log(`Duplicate slugs: ${finalDuplicates.length}`);
        console.log(`Schema-invalid records: ${invalid.length}`);
        console.log(`Invalid data types: ${typeErrors.length}`);
        console.log("Restored catalog records:");
        console.log(
            JSON.stringify(
                restored.map((document) => ({
                    title: document.title,
                    slug: document.slug,
                    duration: document.duration,
                    price: document.price,
                    thumbnail: document.thumbnail,
                })),
                null,
                2
            )
        );
        console.log(`Backup: ${backupPath}`);
    } finally {
        await mongoose.disconnect();
    }
};

main().catch((error) => {
    console.error(`Internship restore aborted: ${error.message}`);
    process.exitCode = 1;
});
