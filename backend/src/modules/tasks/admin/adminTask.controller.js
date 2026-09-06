import Task from "../models/Task.js";
import Notification from "../../notifications/models/Notification.js";

import asyncHandler from "../../../core/http/asyncHandler.js";
import AppError from "../../../core/errors/AppError.js";

// ======================================
// GET ALL PENDING TASKS
// ======================================

export const getPendingTasks = asyncHandler(async (req, res) => {

    const tasks = await Task.find({

        status: "Submitted"

    })

        .populate(
            "assignedTo",
            "firstName lastName username avatar"
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

        total: tasks.length,

        tasks

    });

});


// ======================================
// GET APPROVED TASKS
// ======================================

export const getApprovedTasks = asyncHandler(async (req, res) => {

    const tasks = await Task.find({

        status: "Approved"

    })

        .populate(
            "assignedTo",
            "firstName lastName username avatar"
        )

        .populate(
            "internship",
            "title"
        )

        .sort({
            reviewedAt: -1
        });

    res.status(200).json({

        success: true,

        total: tasks.length,

        tasks

    });

});


// ======================================
// GET SINGLE TASK
// ======================================

export const getTaskDetails = asyncHandler(async (req, res) => {

    const task = await Task.findById(req.params.id)

        .populate(
            "assignedTo",
            "firstName lastName username email avatar github linkedin"
        )

        .populate(
            "internship",
            "title description"
        )

        .populate(
            "reviewedBy",
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


// ======================================
// APPROVE TASK
// ======================================

export const approveTask = asyncHandler(async (req, res) => {

    const task = await Task.findById(req.params.id);

    if (!task) {

        throw new AppError(
            "Task not found",
            404
        );

    }

    task.status = "Approved";

    task.reviewedBy = req.user._id;

    task.reviewedAt = new Date();

    task.adminComment = req.body.comment || "";

    await task.save();

    await Notification.create({

        user: task.assignedTo,

        title: "Task Approved",

        message: `Your task "${task.title}" has been approved.`,

        type: "system",
        context: {
            taskId: task._id,
            internshipId: task.internship
        }

    });

    res.status(200).json({

        success: true,

        message: "Task approved successfully."

    });

});


// ======================================
// REJECT TASK
// ======================================

export const rejectTask = asyncHandler(async (req, res) => {

    const task = await Task.findById(req.params.id);

    if (!task) {

        throw new AppError(
            "Task not found",
            404
        );

    }

    task.status = "Incorrect";

    task.reviewedBy = req.user._id;

    task.reviewedAt = new Date();

    task.adminComment = req.body.comment || "";

    await task.save();

    await Notification.create({

        user: task.assignedTo,

        title: "Task Rejected",

        message:
            req.body.comment ||
            "Please improve your task and submit again.",

        type: "system",
        context: {
            taskId: task._id,
            internshipId: task.internship
        }

    });

    res.status(200).json({

        success: true,

        message: "Task rejected successfully."

    });

});