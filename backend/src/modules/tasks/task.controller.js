import mongoose from "mongoose";
import Task from "./models/Task.js";
import StudentInternship from "../internships/models/StudentInternship.js";
import Certificate from "../certificates/models/Certificate.js";
import Badge from "../profile/models/Badges.js";
import UserBadge from "../profile/models/UserBadge.js";
import Notification from "../notifications/models/Notification.js";
import User from "../user/models/User.js";
import Internship from "../internships/models/Internship.js";

import { getIO } from "../../infrastructure/socket/socket.js";

import asyncHandler from "../../core/http/asyncHandler.js";
import AppError from "../../core/errors/AppError.js";

import logActivity from "../activity/logActivity.js";

import { generateCertificatePDF } from "../certificates/services/generateCertificatePDF.js";

import { sendCertificateEmail } from "../../infrastructure/email/index.js";

// =====================================
// CREATE TASK
// =====================================

export const createTask = asyncHandler(async (req, res) => {


    const {
        title,
        description,
        assignedTo,
        internship,
        dueDate

    } = req.body;



    const task = await Task.create({

        title,

        description,

        assignedBy: req.user._id,

        assignedTo,

        internship,

        dueDate

    });

    await logActivity(

        req,

        req.user._id,

        "CREATE_TASK",

        "Task",

        `Created task: ${task.title}`

    );



    res.status(201).json({

        success: true,

        message: "Task created successfully",

        task

    });


});





// =====================================
// GET MY TASKS
// =====================================


export const getMyTasks = asyncHandler(async (req, res) => {

    const tasks = await Task.find({

        assignedTo: req.user._id

    })

        .populate(

            "assignedBy",

            "firstName lastName email"

        )

        .populate(

            "internship",

            "title duration level"

        )

        .sort({

            createdAt: -1

        });

    res.status(200).json({

        success: true,

        tasks

    });

});






// =====================================
// UPDATE TASK STATUS
// =====================================


// =====================================
// SUBMIT TASK
// =====================================

export const updateTaskStatus = asyncHandler(async (req, res) => {

    const {
        code,
        answer,
        githubLink,
        liveLink,
        taskId
    } = req.body;

    // Support both PATCH /:id/status (req.params.id) and the POST /submit
    // endpoint (taskId in the body).
    const id = req.params.id || taskId;

    const task = await Task.findById(id);

    if (!task) {
        throw new AppError("Task not found", 404);
    }

    if (task.assignedTo.toString() !== req.user._id.toString()) {
        throw new AppError("Unauthorized", 403);
    }

    // Already approved
    if (task.reviewStatus === "Approved") {
        throw new AppError(
            "Task already approved",
            400
        );
    }

    task.code = code || "";

    task.answer = answer || "";

    task.githubLink = githubLink || "";

    task.liveLink = liveLink || "";

    task.status = "Completed";

    task.reviewStatus = "Pending";

    task.submittedAt = new Date();

    await task.save();

    await logActivity(

        req,

        req.user._id,

        "SUBMIT_TASK",

        "Task",

        `Submitted task: ${task.title}`

    );

    const io = getIO();

    io.emit("taskSubmitted", {

        taskId: task._id,

        student: req.user._id,

        title: task.title,

        status: task.status

    });

    // ==========================
    // Notify Admin
    // ==========================

    const admins = await User.find({
        role: "admin"
    });

    for (const admin of admins) {

        await Notification.create({

            user: admin._id,

            title: "Task Approval",

            message: `${req.user.firstName} ${req.user.lastName} submitted "${task.title}" for approval.`,

            type: "system"

        });

    }

    return res.status(200).json({

        success: true,

        message: "Task submitted successfully. Waiting for admin approval.",

        task

    });

});



// =====================================
// SUBMIT COURSE TASK (POST /api/tasks/submit)
// Course tasks live in JSON files and may not have a DB Task document.
// This endpoint records the submission without throwing a 404 (which the
// frontend axios interceptor would redirect to /404).
// =====================================
export const submitTask = asyncHandler(async (req, res) => {

    const {
        taskId,
        code,
        answer,
        githubLink,
        liveLink,
        courseSlug
    } = req.body;

    if (!taskId) {
        throw new AppError("taskId is required", 400);
    }

    // If a matching DB task exists, update it (best-effort) so admins can
    // review it in the Task Approval section.
    if (taskId && mongoose.isValidObjectId(taskId)) {
        const task = await Task.findById(taskId);
        if (task && task.assignedTo.toString() === req.user._id.toString()) {
            task.code = code || "";
            task.answer = answer || "";
            task.githubLink = githubLink || "";
            task.liveLink = liveLink || "";
            task.status = "Completed";
            task.reviewStatus = "Pending";
            task.submittedAt = new Date();
            await task.save();

            await logActivity(
                req,
                req.user._id,
                "SUBMIT_TASK",
                "Task",
                `Submitted task: ${task.title}`
            );

            const io = getIO();
            io.emit("taskSubmitted", {
                taskId: task._id,
                student: req.user._id,
                title: task.title,
                status: task.status
            });

            const admins = await User.find({ role: "admin" });
            for (const admin of admins) {
                await Notification.create({
                    user: admin._id,
                    title: "Task Approval",
                    message: `${req.user.firstName} ${req.user.lastName} submitted "${task.title}" for approval.`,
                    type: "system"
                });
            }
        }
    }

    // Always return success — course task progress is tracked client-side.
    return res.status(200).json({
        success: true,
        message: "Task submitted successfully. Waiting for approval.",
        taskId,
        courseSlug
    });

});


export const updateTask = asyncHandler(async (req, res) => {

    const task = await Task.findById(req.params.id);

    if (!task) {
        throw new AppError("Task not found", 404);
    }

    const {
        title,
        description,
        dueDate,
        status
    } = req.body;

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (dueDate !== undefined) task.dueDate = dueDate;
    if (status !== undefined) task.status = status;

    await task.save();

    await logActivity(

        req,

        req.user._id,

        "UPDATE_TASK",

        "Task",

        `Updated task: ${task.title}`

    );

    res.status(200).json({
        success: true,
        message: "Task updated successfully",
        task
    });

});





// =====================================
// DELETE TASK
// =====================================


export const deleteTask = asyncHandler(async (req, res) => {


    const task =
        await Task.findById(req.params.id);



    if (!task) {

        throw new AppError(
            "Task not found",
            404
        );

    }

    await logActivity(

        req,

        req.user._id,

        "DELETE_TASK",

        "Task",

        `Deleted task: ${task.title}`

    );



    await Task.findByIdAndDelete(
        req.params.id
    );



    res.status(200).json({

        success: true,

        message: "Task deleted"

    });


});







// =====================================
// CREATE CERTIFICATE
// =====================================


const createCertificate = async (student, internship) => {


    const existing =
        await Certificate.findOne({

            student,

            internship

        });



    if (existing) {

        return;

    }




    const certificate =
        await Certificate.create({

            student,

            internship,

            certificateNumber:
                "TM-" + Date.now()

        });



    return certificate;


};







// =====================================
// GIVE BADGE
// =====================================


const giveCompletionBadge = async (userId) => {

    const badge =
        await Badge.findOne({

            title: "Internship Completed"

        });



    if (!badge) {

        return;

    }




    const already =
        await UserBadge.findOne({

            user: userId,

            badge: badge._id

        });



    if (already) {

        return;

    }




    await UserBadge.create({

        user: userId,

        badge: badge._id

    });



};


// =====================================
// GET PENDING TASKS
// =====================================

export const getPendingTasks = asyncHandler(async (req, res) => {

    const tasks = await Task.find({

        reviewStatus: "Pending",

        status: "Completed"

    })

        .populate(

            "assignedTo",

            "firstName lastName username email avatar"

        )

        .populate(

            "internship",

            "title"

        )

        .sort({

            submittedAt: -1

        });

    res.status(200).json({

        success: true,

        tasks

    });

});


// =====================================
// GET TASK DETAILS
// =====================================

export const getTaskDetails = asyncHandler(async (req, res) => {

    const task = await Task.findById(

        req.params.id

    )

        .populate(

            "assignedTo",

            "firstName lastName username email avatar github linkedin"

        )

        .populate(

            "internship",

            "title"

        );

    if (!task) {

        throw new AppError(

            "Task not found",

            404

        );

    }

    res.status(200).json({

        success: true,

        task

    });

});


// =====================================
// APPROVE TASK
// =====================================

export const approveTask = asyncHandler(async (req, res) => {

    const task = await Task.findById(req.params.id);

    if (!task) {

        throw new AppError(
            "Task not found",
            404
        );

    }

    task.reviewStatus = "Approved";

    task.reviewComment =
        req.body.comment || "";

    task.reviewedBy =
        req.user._id;

    task.reviewedAt =
        new Date();

    await task.save();

    await logActivity(

        req,

        req.user._id,

        "APPROVE_TASK",

        "Task",

        `Approved task: ${task.title}`

    );

    await Notification.create({

        user: task.assignedTo,

        title: "Task Approved ✅",

        message:
            `"${task.title}" has been approved by Admin.`,

        type: "system"

    });

    res.status(200).json({

        success: true,

        message: "Task approved successfully",

        task

    });

});

// =====================================
// REJECT TASK
// =====================================

export const rejectTask = asyncHandler(async (req, res) => {

    const task = await Task.findById(req.params.id);

    if (!task) {

        throw new AppError(
            "Task not found",
            404
        );

    }

    task.reviewStatus = "Rejected";

    task.reviewComment =
        req.body.comment || "";

    task.reviewedBy =
        req.user._id;

    task.reviewedAt =
        new Date();

    await task.save();

    await logActivity(

        req,

        req.user._id,

        "REJECT_TASK",

        "Task",

        `Rejected task: ${task.title}`

    );

    await Notification.create({

        user: task.assignedTo,

        title: "Task Review ❌",

        message:
            req.body.comment ||
            `"${task.title}" requires correction. Please update and submit again.`,

        type: "system"

    });

    res.status(200).json({

        success: true,

        message: "Task rejected successfully",

        task

    });

});


// =====================================
// GET SINGLE TASK
// =====================================

export const getSingleTask = asyncHandler(async (req, res) => {

    const task = await Task.findOne({

        _id: req.params.id,

        assignedTo: req.user._id

    })

        .populate(

            "internship",

            "title duration level"

        )

        .populate(

            "assignedBy",

            "firstName lastName"

        );

    if (!task) {

        throw new AppError(

            "Task not found",

            404

        );

    }

    res.status(200).json({

        success: true,

        task

    });

});