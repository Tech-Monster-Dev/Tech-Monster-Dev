import mongoose from "mongoose";
import { readFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

import Course from "./models/Course.js";
import StudentInternship from "../internships/models/StudentInternship.js";
import Submission from "../submissions/models/Submission.js";
import { emitToUser } from "../../infrastructure/socket/socket.js";

import asyncHandler from "../../core/http/asyncHandler.js";
import AppError from "../../core/errors/AppError.js";

import cloudinary from "../../infrastructure/storage/cloudinary.js";
import streamifier from "streamifier";
import { recordLessonLearningDay } from "../learning/learningDay.service.js";

import {
    safeSendActivityEmail,
} from "../../infrastructure/email/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const coursesDir = path.resolve(__dirname, "../../../data/courses");
const TASK_DEADLINE_MS = 48 * 60 * 60 * 1000;

const normalizeSlug = (slug) =>
    String(slug || "")
        .trim()
        .toLowerCase()
        .replace(/_/g, "-");

const readCourseDataFromFile = async (courseSlug) => {
    if (!courseSlug) return null;

    try {
        const folders = await (await import("fs/promises")).readdir(
            coursesDir,
            { withFileTypes: true }
        );

        const normalizedTarget = normalizeSlug(courseSlug);

        for (const folder of folders) {
            if (!folder.isDirectory()) continue;

            const filePath = path.join(
                coursesDir,
                folder.name,
                "course.json"
            );

            try {
                const raw = await readFile(filePath, "utf8");
                const parsed = JSON.parse(raw);
                const courseData = parsed?.course || parsed;

                if (
                    normalizeSlug(courseData?.slug) ===
                    normalizedTarget
                ) {
                    return courseData;
                }
            } catch {
                continue;
            }
        }

        return null;
    } catch {
        return null;
    }
};

const getOrderedCourseTasks = (courseData, courseSlug) => {
    if (!Array.isArray(courseData?.modules)) {
        return [];
    }

    const orderedTasks = [];
    const seen = new Set();

    courseData.modules.forEach((module) => {
        const moduleId = String(
            module.moduleId ||
            module.id ||
            ""
        ).trim();

        const moduleTitle =
            module.moduleTitle ||
            module.title ||
            "";

        // Current structure: module.tasks[]
        if (Array.isArray(module.tasks)) {
            module.tasks.forEach((task) => {
                const taskId = String(
                    task.taskId ||
                    task.id ||
                    ""
                ).trim();

                if (!taskId || seen.has(taskId)) {
                    return;
                }

                seen.add(taskId);

                orderedTasks.push({
                    courseSlug,
                    moduleId,
                    moduleTitle,
                    lessonId: String(
                        task.lessonId ||
                        ""
                    ).trim(),
                    taskId,
                    taskTitle:
                        task.title ||
                        "Task",
                    problemStatement:
                        task.problemStatement ||
                        "",
                });
            });
        }

        // Backward compatibility:
        // older structure: lesson.tasks[]
        if (Array.isArray(module.lessons)) {
            module.lessons.forEach((lesson) => {
                const lessonId = String(
                    lesson.lessonId ||
                    lesson.id ||
                    ""
                ).trim();

                if (!Array.isArray(lesson.tasks)) {
                    return;
                }

                lesson.tasks.forEach((task) => {
                    const taskId = String(
                        task.taskId ||
                        task.id ||
                        ""
                    ).trim();

                    if (!taskId || seen.has(taskId)) {
                        return;
                    }

                    seen.add(taskId);

                    orderedTasks.push({
                        courseSlug,
                        moduleId,
                        moduleTitle,
                        lessonId,
                        taskId,
                        taskTitle:
                            task.title ||
                            "Task",
                        problemStatement:
                            task.problemStatement ||
                            "",
                    });
                });
            });
        }
    });

    return orderedTasks;
};

const unlockFirstEligibleLessonTask = async ({
    student,
    course,
    courseSlug,
    lessonId,
    courseData
}) => {
    const modules = courseData?.modules || [];

    const moduleIndex = modules.findIndex((module) =>
        (module.lessons || []).some((lesson) =>
            String(
                lesson.lessonId ||
                lesson.id ||
                ""
            ) === String(lessonId)
        )
    );

    if (moduleIndex < 0) {
        return null;
    }

    const currentModule = modules[moduleIndex];

    const moduleId = String(
        currentModule.moduleId ||
        currentModule.id ||
        ""
    ).trim();

    if (!moduleId) {
        return null;
    }

    const studentCourse =
        await StudentInternship.findOne({
            student,
            course: course._id
        });

    const completedLessons =
        studentCourse?.completedLessons || [];

    const currentModuleCompleted =
        isModuleLessonsCompleted(
            courseData,
            moduleId,
            completedLessons
        );

    if (!currentModuleCompleted) {
        return null;
    }

    if (moduleIndex > 0) {
        const previousModule =
            modules[moduleIndex - 1];

        const previousModuleId =
            String(
                previousModule.moduleId ||
                previousModule.id ||
                ""
            ).trim();

        const previousModuleTasks =
            getOrderedCourseTasks(
                {
                    modules: [
                        previousModule
                    ]
                },
                courseSlug
            );

        if (!previousModuleTasks.length) {
            return null;
        }

        const previousModuleApproved =
            await areModuleTasksApproved({
                student,
                course: course._id,
                courseSlug,
                moduleId: previousModuleId,
                courseData
            });

        if (!previousModuleApproved) {
            return null;
        }
    }

    const currentModuleTasks =
        getOrderedCourseTasks(
            {
                modules: [
                    currentModule
                ]
            },
            courseSlug
        );

    if (!currentModuleTasks.length) {
        return null;
    }

    const targetTask =
        currentModuleTasks[0];

    const existing =
        await Submission.findOne({
            student,
            course: course._id,
            courseSlug,
            moduleId:
                targetTask.moduleId,
            lessonId:
                targetTask.lessonId,
            taskId:
                targetTask.taskId
        });

    if (existing) {
        return existing;
    }

    const unlockedAt =
        new Date();

    const submission =
        await Submission.create({
            student,

            course:
                course._id,

            internship:
                null,

            courseSlug,

            moduleId:
                targetTask.moduleId,

            moduleTitle:
                targetTask.moduleTitle,

            lessonId:
                targetTask.lessonId,

            taskId:
                targetTask.taskId,

            taskTitle:
                targetTask.taskTitle,

            problemStatement:
                targetTask.problemStatement,

            status:
                "unlocked",

            unlockedAt,

            expiresAt:
                new Date(
                    unlockedAt.getTime() +
                    TASK_DEADLINE_MS
                ),

            expiredAt:
                null
        });

    const taskUnlock =
        submission;

    emitToUser(
        student,
        "taskUnlocked",
        {
            taskUnlock,

            taskKey:
                [
                    String(
                        taskUnlock.moduleId ||
                        ""
                    ),
                    String(
                        taskUnlock.lessonId ||
                        ""
                    ),
                    String(
                        taskUnlock.taskId ||
                        ""
                    )
                ].join("_")
        }
    );

    return taskUnlock;
};

const isModuleLessonsCompleted = (courseData, moduleId, completedLessons = []) => {
    const module = (courseData?.modules || []).find(
        (item) =>
            String(item.moduleId || item.id || "") ===
            String(moduleId)
    );

    if (
        module == null ||
        Array.isArray(module.lessons) == false ||
        module.lessons.length === 0
    ) {
        return false;
    }

    const completedSet = new Set(completedLessons);

    return module.lessons.every((lesson) => {
        const lessonId = String(
            lesson.lessonId ||
            lesson.id ||
            ""
        );

        return (
            lessonId &&
            completedSet.has(lessonId)
        );
    });
};

const areModuleTasksApproved = async ({
    student,
    course,
    courseSlug,
    moduleId,
    courseData
}) => {
    const module = (courseData?.modules || []).find(
        (item) =>
            String(item.moduleId || item.id || "") ===
            String(moduleId)
    );

    if (module == null) {
        return false;
    }

    const taskIds = [];

    // Current course structure stores tasks directly
    // on the module: module.tasks[].
    if (Array.isArray(module.tasks)) {
        module.tasks.forEach((task) => {
            const taskId = String(
                task.taskId ||
                task.id ||
                ""
            ).trim();

            if (taskId) {
                taskIds.push({
                    lessonId: String(
                        task.lessonId ||
                        ""
                    ).trim(),
                    taskId
                });
            }
        });
    }

    // Backward compatibility for older lesson-level tasks.
    if (taskIds.length === 0) {
        module.lessons?.forEach((lesson) => {
            (lesson.tasks || []).forEach((task) => {
                const taskId = String(
                    task.taskId ||
                    task.id ||
                    ""
                ).trim();

                const lessonId = String(
                    lesson.lessonId ||
                    lesson.id ||
                    ""
                ).trim();

                if (taskId) {
                    taskIds.push({
                        lessonId,
                        taskId
                    });
                }
            });
        });
    }

    if (taskIds.length === 0) {
        return false;
    }

    const approvedCount =
        await Submission.countDocuments({
            student,
            course,
            courseSlug,
            moduleId: String(moduleId),
            status: "approved",
            $or: taskIds
        });

    return approvedCount === taskIds.length;
};

const uploadToCloudinary = (fileBuffer) =>
    new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder: "tech_monster_courses" },
            (error, result) => {
                if (result) {
                    resolve(result);
                } else {
                    reject(error);
                }
            }
        );
        streamifier.createReadStream(fileBuffer).pipe(stream);
    });

export const createCourse = asyncHandler(async (req, res) => {
    const {
        title,
        slug,
        category,
        level,
        description,
        duration,
        price,
        totalTasks,
        totalNotes
    } = req.body || {};

    let thumbnail = "";
    if (req.file) {
        const cloudinaryResponse = await uploadToCloudinary(req.file.buffer);
        thumbnail = cloudinaryResponse.secure_url;
    }

    const course = await Course.create({
        title,
        slug: normalizeSlug(slug),
        category,
        level,
        description,
        thumbnail,
        duration,
        price,
        totalTasks,
        totalNotes,
        isPublished: true
    });

    res.status(201).json({
        success: true,
        message: "Course created successfully",
        course
    });
});

export const getAllCourses = asyncHandler(async (req, res) => {
    const courses = await Course.find({ isPublished: true }).sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        courses
    });
});

export const getSingleCourse = asyncHandler(async (req, res) => {
    const hasSlug = req.params.slug !== undefined;
    const identifier = hasSlug ? req.params.slug : req.params.id;
    const normalizedSlug = normalizeSlug(identifier);

    let course = null;

    if (hasSlug) {
        course = await Course.findOne({ slug: normalizedSlug });
    } else {
        course = await (mongoose.isValidObjectId(identifier)
            ? Course.findById(identifier)
            : Course.findOne({ slug: normalizedSlug }));
    }

    if (!course) {
        throw new AppError("Course not found", 404);
    }

    const courseData = await readCourseDataFromFile(course.slug);
    const payload = {
        ...course.toObject(),
        slug: normalizeSlug(course.slug),
        modules: courseData?.modules || []
    };

    if (courseData) {
        payload.title = courseData.title || course.title;
        payload.category = courseData.category || course.category;
    }

    res.status(200).json({
        success: true,
        course: payload
    });
});

export const joinCourse = asyncHandler(async (req, res) => {
    const course = await Course.findById(req.params.id);

    if (!course) {
        throw new AppError("Course not found", 404);
    }

    const alreadyJoined = await StudentInternship.findOne({
        student: req.user._id,
        course: course._id
    });

    if (alreadyJoined) {
        throw new AppError("Already joined this course", 400);
    }

    const studentCourse = await StudentInternship.create({
        student: req.user._id,
        course: course._id,
        status: "In Progress",
        startedAt: new Date()
    });

    res.status(201).json({
        success: true,
        message: "Course joined successfully",
        studentCourse
    });
});

export const getMyCourses = asyncHandler(async (req, res) => {
    const courses = await StudentInternship.find({
        student: req.user._id,
        course: { $ne: null }
    })
        .populate("course")
        .sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        courses
    });
});

export const updateCourseProgress = asyncHandler(async (req, res) => {
    const { progress } = req.body;

    const studentCourse = await StudentInternship.findOne({
        student: req.user._id,
        course: req.params.id
    });

    if (!studentCourse) {
        throw new AppError("Course enrollment not found", 404);
    }

    studentCourse.progress = progress;
    studentCourse.status = progress > 0 ? "In Progress" : "Not Started";

    if (progress >= 100) {
        studentCourse.progress = 100;
        studentCourse.status = "Completed";
        studentCourse.completedAt = new Date();
    }

    await studentCourse.save();

    res.status(200).json({
        success: true,
        message: "Progress updated",
        studentCourse
    });
});

export const completeCourse = asyncHandler(async (req, res) => {
    const studentCourse = await StudentInternship.findOne({
        student: req.user._id,
        course: req.params.id
    });

    if (!studentCourse) {
        throw new AppError("Course not found", 404);
    }

    studentCourse.status = "Completed";
    studentCourse.progress = 100;
    studentCourse.completedAt = new Date();

    await studentCourse.save();

    res.status(200).json({
        success: true,
        message: "Course completed",
        studentCourse
    });
});

export const completeLesson = asyncHandler(async (req, res) => {
    const { slug } = req.params;
    const { lessonId } = req.body || {};

    if (!lessonId) {
        throw new AppError("lessonId is required", 400);
    }

    const normalizedSlug = normalizeSlug(slug);
    const course = await Course.findOne({ slug: normalizedSlug });

    if (!course) {
        throw new AppError("Course not found", 404);
    }

    const studentCourse = await StudentInternship.findOne({
        student: req.user._id,
        course: course._id
    });

    if (!studentCourse) {
        return res.status(200).json({
            success: true,
            message: "Enrollment not found; progress stored locally only",
            completedLessons: []
        });
    }

    const alreadyCompleted =
        Array.isArray(studentCourse.completedLessons) &&
        studentCourse.completedLessons.includes(lessonId);

    if (!alreadyCompleted) {
        studentCourse.completedLessons.push(lessonId);
    }

    await studentCourse.save();

    const courseData = await readCourseDataFromFile(normalizedSlug);
    console.log("=== LESSON TASK UNLOCK DEBUG ===");
    console.log("courseSlug:", normalizedSlug);
    console.log("lessonId:", lessonId);
    console.log("courseId:", String(course._id));
    console.log(
        "completedLessons:",
        studentCourse.completedLessons
    );
    console.log(
        "courseModules:",
        courseData?.modules?.length || 0
    );

    const unlockedSubmission =
        await unlockFirstEligibleLessonTask({
            student: req.user._id,
            course: course._id,
            courseSlug: normalizedSlug,
            lessonId,
            courseData
        });

    console.log(
        "unlockedSubmission:",
        unlockedSubmission
    );
    console.log("=== END LESSON TASK UNLOCK DEBUG ===");

    await recordLessonLearningDay({
        studentId: req.user._id,
        courseSlug: normalizedSlug,
        courseId: course._id,
        lessonId,
        startedAt: studentCourse.startedAt
    });

    const totalLessons = (courseData?.modules || []).reduce(
        (sum, module) => sum + (module.lessons?.length || 0),
        0
    );

    const progress = totalLessons > 0
        ? Math.min(100, Math.round((studentCourse.completedLessons.length / totalLessons) * 100))
        : studentCourse.progress;

    studentCourse.progress = progress;
    studentCourse.status = progress >= 100 ? "Completed" : "In Progress";
    if (progress >= 100) {
        studentCourse.completedAt = new Date();
    }

    await studentCourse.save();

    res.status(200).json({
        success: true,
        message: alreadyCompleted ? "Lesson already completed" : "Lesson completed",
        completedLessons: studentCourse.completedLessons,
        progress,
        unlockedSubmission
    });
});

export const getCompletedLessons = asyncHandler(async (req, res) => {
    const normalizedSlug = normalizeSlug(req.params.slug);
    const course = await Course.findOne({ slug: normalizedSlug });

    if (!course) {
        throw new AppError("Course not found", 404);
    }

    const studentCourse = await StudentInternship.findOne({
        student: req.user._id,
        course: course._id
    });

    res.status(200).json({
        success: true,
        completedLessons: studentCourse?.completedLessons || []
    });
});

export const updateCourse = asyncHandler(async (req, res) => {
    const { title, slug, category, level, description, duration, price, totalTasks, totalNotes } = req.body;

    let course = await Course.findById(req.params.id);
    if (!course) {
        throw new AppError("Course not found", 404);
    }

    let thumbnail = course.thumbnail;
    if (req.file) {
        const cloudinaryResponse = await uploadToCloudinary(req.file.buffer);
        thumbnail = cloudinaryResponse.secure_url;
    }

    course = await Course.findByIdAndUpdate(
        req.params.id,
        {
            title: title || course.title,
            slug: slug ? normalizeSlug(slug) : course.slug,
            category: category || course.category,
            level: level || course.level,
            description: description || course.description,
            thumbnail,
            duration: duration || course.duration,
            price: price !== undefined ? price : course.price,
            totalTasks: totalTasks !== undefined ? totalTasks : course.totalTasks,
            totalNotes: totalNotes !== undefined ? totalNotes : course.totalNotes
        },
        { new: true, runValidators: true }
    );

    res.status(200).json({
        success: true,
        message: "Course updated successfully",
        course
    });
});

export const deleteCourse = asyncHandler(async (req, res) => {
    const course = await Course.findById(req.params.id);
    if (!course) {
        throw new AppError("Course not found", 404);
    }

    await Course.findByIdAndDelete(req.params.id);
    await StudentInternship.deleteMany({ course: req.params.id });

    res.status(200).json({
        success: true,
        message: "Course and related enrollments deleted successfully"
    });
});
