import mongoose from "mongoose";
import { readFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

import Internship from "./models/Internship.js";
import StudentInternship from "./models/StudentInternship.js";
import Submission from "../submissions/models/Submission.js";

import { emitToUser } from "../../infrastructure/socket/socket.js";

import asyncHandler from "../../core/http/asyncHandler.js";
import AppError from "../../core/errors/AppError.js";
import {
    safeSendActivityEmail,
    sendAllLessonsCompletedEmail,
    sendInternshipJoinedEmail,
    sendLessonCompletedEmail,
    sendProgramCompletedEmail
} from "../../infrastructure/email/index.js";

import cloudinary from "../../infrastructure/storage/cloudinary.js";
import streamifier from "streamifier";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const internshipsDir = path.resolve(__dirname, "../../data/internship");
const TASK_DEADLINE_MS = 48 * 60 * 60 * 1000;

const readInternshipDataFromFile = async (internshipSlug) => {

    if (!internshipSlug) {
        return null;
    }

    const normalizedSlug = normalizeSlug(
        internshipSlug
    );

    const filePath = path.join(
        internshipsDir,
        `${normalizedSlug}.json`
    );

    try {

        const raw = await readFile(
            filePath,
            "utf8"
        );

        const data = JSON.parse(raw);

        console.log(
            "========== INTERNSHIP JSON =========="
        );

        console.log(
            "Slug:",
            normalizedSlug
        );

        console.log(
            "File:",
            filePath
        );

        console.log(
            "Modules:",
            data?.modules?.length || 0
        );

        console.log(
            "First Module:",
            data?.modules?.[0]?.moduleTitle
        );

        console.log(
            "First Lesson:",
            data?.modules?.[0]?.lessons?.[0]?.lessonTitle
        );

        console.log(
            "====================================="
        );

        return data;

    } catch (error) {

        console.error(
            "❌ INTERNSHIP JSON LOAD FAILED"
        );

        console.error(
            "File:",
            filePath
        );

        console.error(
            "Error:",
            error.message
        );

        return null;
    }
};

// Normalize a slug so both "frontend_dev" and "frontend-dev" resolve to the
// dash-based slug used by the JSON course files and the DB.
const normalizeSlug = (slug) => {
    if (!slug) return "";
    return String(slug)
        .trim()
        .toLowerCase()
        .replace(/_/g, "-");
};

const findLessonName = (courseData, lessonId) => {
    for (const module of courseData?.modules || []) {
        const lesson = (module.lessons || []).find((item) => item.lessonId === lessonId);
        if (lesson) return lesson.lessonTitle || lessonId;
    }
    return lessonId;
};

const getOrderedCourseTasks = (courseData, courseSlug) => {
    if (!Array.isArray(courseData?.modules)) return [];

    return courseData.modules.flatMap((module) => {
        const moduleId = module.moduleId || "";
        const seen = new Set();
        const tasks = [];

        (module.lessons || []).forEach((lesson) => {
            (lesson.tasks || []).forEach((task) => {
                const taskId = task.taskId || "";
                if (!taskId || seen.has(taskId)) return;
                seen.add(taskId);

                tasks.push({
                    courseSlug,
                    moduleId,
                    moduleTitle: module.moduleTitle || "",
                    lessonId: lesson.lessonId || "",
                    taskId,
                    taskTitle: task.title || "Task",
                    problemStatement: task.problemStatement || ""
                });
            });
        });

        return tasks;
    });
};

const unlockFirstEligibleLessonTask = async ({
    student,
    internship,
    courseSlug,
    lessonId,
    courseData
}) => {
    const orderedTasks = getOrderedCourseTasks(courseData, courseSlug);
    const targetIndex = orderedTasks.findIndex((task) => task.lessonId === lessonId);

    if (targetIndex < 0) return null;

    const targetTask = orderedTasks[targetIndex];
    const existing = await Submission.findOne({
        student,
        courseSlug,
        moduleId: targetTask.moduleId,
        lessonId: targetTask.lessonId,
        taskId: targetTask.taskId
    });

    if (existing) return existing;

    const previousTask = orderedTasks[targetIndex - 1];
    if (previousTask) {
        const previousSubmission = await Submission.findOne({
            student,
            courseSlug,
            moduleId: previousTask.moduleId,
            taskId: previousTask.taskId,
            status: "approved"
        });

        if (!previousSubmission) return null;
    }

    const unlockedAt = new Date();
    const submission = await Submission.create({
        student,
        internship,
        courseSlug,
        moduleId: targetTask.moduleId,
        moduleTitle: targetTask.moduleTitle,
        lessonId: targetTask.lessonId,
        taskId: targetTask.taskId,
        taskTitle: targetTask.taskTitle,
        problemStatement: targetTask.problemStatement,
        status: "unlocked",
        unlockedAt,
        expiresAt: new Date(unlockedAt.getTime() + TASK_DEADLINE_MS)
    });

    emitToUser(student, "taskUnlocked", {
        submission,
        taskKey: getSubmissionTaskKey(
    submission
)
    });

    return submission;
};

// Helper function to upload memory buffer to Cloudinary
const uploadToCloudinary = (fileBuffer) => {
    return new Promise((resolve, reject) => {
        let stream = cloudinary.uploader.upload_stream(
            { folder: "tech_monster_internships" },
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
};



// =====================================
// ADMIN CREATE INTERNSHIP
// =====================================

export const createInternship = asyncHandler(async (req, res) => {


    const {
        title,
        slug,
        category,
        level,
        description,
        duration,
        totalTasks,
        totalNotes
    } = req.body || {};

    // Handle image upload using memory buffer and cloudinary
    let thumbnail = "";
    if (req.file) {
        const cloudinaryResponse = await uploadToCloudinary(req.file.buffer);
        thumbnail = cloudinaryResponse.secure_url;
    }



    const internship = await Internship.create({

        title,

        slug,

        category,

        level,

        description,

        thumbnail,

        duration,

        totalTasks,

        totalNotes,

        isPublished: true

    });



    res.status(201).json({

        success: true,

        message: "Internship created successfully",

        internship

    });


});




// =====================================
// GET ALL INTERNSHIP
// =====================================

export const getAllInternships = asyncHandler(async (req, res) => {


    const internships =
        await Internship.find({

            isPublished: true

        })
            .sort({

                createdAt: -1

            });



    res.status(200).json({

        success: true,

        internships

    });



});





// =====================================
// GET SINGLE INTERNSHIP
// =====================================

export const getSingleInternship = asyncHandler(async (req, res) => {


    const hasSlug = req.params.slug !== undefined;
    const identifier = hasSlug ? req.params.slug : req.params.id;

    // Normalize the slug so both "frontend_dev" and "frontend-dev" work.
    const normalizedSlug = normalizeSlug(identifier);

    // Resolve the internship: by slug (case-insensitive / underscore-insensitive)
    // or by ObjectId when the identifier is a valid Mongo id.
    let internship = null;

    if (hasSlug) {
        internship =
            await Internship.findOne({
                slug: normalizedSlug
            });
    } else {
        const isValidId =
            mongoose.isValidObjectId(identifier);

        internship =
            await (isValidId
                ? Internship.findById(identifier)
                : Internship.findOne({ slug: normalizedSlug }));
    }



    if (!internship) {

        throw new AppError(
            "Internship not found",
            404
        );

    }

    const courseData = await readInternshipDataFromFile(normalizedSlug);

    const payload = {
        ...internship.toObject(),
        slug: normalizedSlug,
        modules: courseData?.modules || []
    };

    // If the DB has no modules but the JSON file does, merge them through.
    if ((!internship.modules || internship.modules.length === 0) && courseData) {
        payload.title = courseData.title || internship.title;
        payload.category = courseData.category || internship.category;
    }

    res.status(200).json({

        success: true,

        internship: payload

    });



});






// =====================================
// STUDENT JOIN INTERNSHIP
// =====================================

export const joinInternship = asyncHandler(async (req, res) => {


    const internship =
        await Internship.findById(
            req.params.id
        );



    if (!internship) {

        throw new AppError(
            "Internship not found",
            404
        );

    }




    const alreadyJoined =
        await StudentInternship.findOne({

            student: req.user._id,

            internship: req.params.id

        });



    if (alreadyJoined) {

        throw new AppError(

            "Already joined this internship",

            400

        );

    }

    const studentInternship = await StudentInternship.create({

        student: req.user._id,

        internship: req.params.id,

        status: "In Progress",

        startedAt: new Date()

    });

    studentInternship.emailFlags.joinedEmailSent = true;
    await studentInternship.save();

    safeSendActivityEmail(
        "internship joined email",
        () => sendInternshipJoinedEmail({
            student: req.user,
            internship,
            enrollment: studentInternship
        })
    );



    res.status(201).json({

        success: true,

        message: "Internship joined successfully",

        studentInternship

    });



});







// =====================================
// GET MY INTERNSHIP
// =====================================


export const getMyInternships = asyncHandler(async (req, res) => {


    const internships = await StudentInternship.find({

        student: req.user._id

    })
        .populate(

            "internship"

        )
        .sort({

            createdAt: -1

        });



    res.status(200).json({

        success: true,

        internships

    });



});








// =====================================
// UPDATE PROGRESS
// =====================================


export const updateInternshipProgress = asyncHandler(async (req, res) => {


    const {

        progress

    } = req.body;



    const studentInternship =
        await StudentInternship.findOne({

            student: req.user._id,

            internship: req.params.id

        });



    if (!studentInternship) {

        throw new AppError(

            "Internship enrollment not found",

            404

        );

    }





    studentInternship.progress =
        progress;



    if (progress >= 100) {


        studentInternship.progress = 100;


        studentInternship.status = "Completed";


        studentInternship.completedAt =
            new Date();


    }




    await studentInternship.save();




    res.status(200).json({

        success: true,

        message: "Progress updated",

        studentInternship

    });



});






// =====================================
// COMPLETE INTERNSHIP MANUALLY
// =====================================


export const completeInternship = asyncHandler(async (req, res) => {


    const studentInternship =
        await StudentInternship.findOne({

            student: req.user._id,

            internship: req.params.id

        });



    if (!studentInternship) {

        throw new AppError(

            "Internship not found",

            404

        );

    }



    studentInternship.status = "Completed";

    studentInternship.progress = 100;

    studentInternship.completedAt = new Date();



    await studentInternship.save();




    res.status(200).json({
        success: true,
        message: "Internship completed",
        studentInternship
    });


});


// =====================================
// COMPLETE A SINGLE LESSON
// =====================================


export const completeLesson = asyncHandler(async (req, res) => {


    const { slug } = req.params;

    const { lessonId } = req.body || {};

    if (!lessonId) {

        throw new AppError(
            "lessonId is required",
            400
        );

    }


    const normalizedSlug = normalizeSlug(slug);


    // Resolve the internship by slug.
    const internship = await Internship.findOne({
        slug: normalizedSlug
    });


    // If the internship does not exist, return 404.
    if (!internship) {

        throw new AppError(
            "Internship not found",
            404
        );

    }


    // Find the student's enrollment.
    const studentInternship = await StudentInternship.findOne({

        student: req.user._id,

        internship: internship._id

    });


    // If the student is not enrolled, we return a 200 with the current
    // (empty) completed list so the frontend axios interceptor does not
    // redirect to /404. The frontend still caches locally.
    if (!studentInternship) {

        return res.status(200).json({

            success: true,

            message: "Enrollment not found; progress stored locally only",

            completedLessons: []

        });

    }


    // Deduplicate the lesson id.
    const alreadyCompleted =
        Array.isArray(studentInternship.completedLessons) &&
        studentInternship.completedLessons.includes(lessonId);


    if (!alreadyCompleted) {

        studentInternship.completedLessons.push(lessonId);

    }


    // Compute the total number of lessons from the course JSON file.
    const courseData = await readCourseDataFromFile(normalizedSlug);

    const unlockedSubmission = !alreadyCompleted
        ? await unlockFirstEligibleLessonTask({
            student: req.user._id,
            internship: internship._id,
            courseSlug: normalizedSlug,
            lessonId,
            courseData
        })
        : null;

    const totalLessons = (courseData?.modules || []).reduce(
        (sum, module) => sum + (module.lessons?.length || 0),
        0
    );


    const completedCount = studentInternship.completedLessons.length;

    const progress = totalLessons > 0
        ? Math.min(100, Math.round((completedCount / totalLessons) * 100))
        : studentInternship.progress;


    studentInternship.progress = progress;

    studentInternship.status = "In Progress";

    if (progress >= 100) {

        studentInternship.status = "Completed";

        studentInternship.completedAt = new Date();

    }


    await studentInternship.save();


    res.status(200).json({

        success: true,

        message: alreadyCompleted ? "Lesson already completed" : "Lesson completed",

        completedLessons: studentInternship.completedLessons,

        progress,

        unlockedSubmission

    });


});




// =====================================
// GET COMPLETED LESSONS FOR A COURSE
// =====================================


export const getCompletedLessons = asyncHandler(async (req, res) => {


    const { slug } = req.params;

    const normalizedSlug = normalizeSlug(slug);


    const internship = await Internship.findOne({
        slug: normalizedSlug
    });


    // If the internship does not exist, return 404.
    if (!internship) {

        throw new AppError(
            "Internship not found",
            404
        );

    }


    const studentInternship = await StudentInternship.findOne({

        student: req.user._id,

        internship: internship._id

    });


    // If not enrolled, return an empty list (200) so the frontend does not
    // get redirected to /404 by the axios interceptor.
    const completedLessons = studentInternship?.completedLessons || [];


    res.status(200).json({

        success: true,

        completedLessons

    });


});


// =====================================
// ADMIN UPDATE INTERNSHIP
// =====================================
export const updateInternship = asyncHandler(async (req, res) => {
    const { title, slug, category, level, description, duration, totalTasks, totalNotes } = req.body;

    let internship = await Internship.findById(req.params.id);
    if (!internship) {
        throw new AppError("Internship not found", 404);
    }

    // Handle new image upload if provided during update
    let thumbnail = internship.thumbnail;

    if (req.file) {
        const cloudinaryResponse = await uploadToCloudinary(req.file.buffer);
        thumbnail = cloudinaryResponse.secure_url;
    }

    internship = await Internship.findByIdAndUpdate(
        req.params.id,
        {
            title: title || internship.title,
            slug: slug || internship.slug,
            category: category || internship.category,
            level: level || internship.level,
            description: description || internship.description,
            thumbnail: thumbnail,
            duration: duration || internship.duration,
            totalTasks:
                totalTasks !== undefined
                    ?
                    totalTasks
                    :
                    internship.totalTasks,


            totalNotes:
                totalNotes !== undefined
                    ?
                    totalNotes
                    :
                    internship.totalNotes,
        },
        { new: true, runValidators: true }
    );

    res.status(200).json({
        success: true,
        message: "Internship updated successfully",
        internship,
    });
});

// =====================================
// ADMIN DELETE INTERNSHIP
// =====================================
export const deleteInternship = asyncHandler(async (req, res) => {
    const internship = await Internship.findById(req.params.id);
    if (!internship) {
        throw new AppError("Internship not found", 404);
    }

    await Internship.findByIdAndDelete(req.params.id);
    // Also remove related student enrollments if needed
    await StudentInternship.deleteMany({ internship: req.params.id });

    res.status(200).json({
        success: true,
        message: "Internship and related enrollments deleted successfully",
    });
});
