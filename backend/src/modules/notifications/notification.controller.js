import Notification from "./models/Notification.js";

import asyncHandler from "../../core/http/asyncHandler.js";
import AppError from "../../core/errors/AppError.js";
import { getIO, getOnlineUsers } from "../../infrastructure/socket/socket.js";

export const sendNotification = asyncHandler(async (req, res) => {
    const { user, title, message, type } = req.body;

    if (!user || !title || !message) {
        throw new AppError("All fields are required", 400);
    }

    const notification = await Notification.create({
        user,
        sender: req.user._id,
        title,
        message,
        type: type || "system"
    });

    const io = getIO();
    const onlineUsers = getOnlineUsers();

    const socketId = onlineUsers.get(
        String(user)
    );

    if (socketId) {
        io.to(socketId).emit(
            "newNotification",
            notification
        );
    }

    res.status(201).json({
        success: true,
        message: "Notification Sent",
        notification
    });
});

export const getMyNotifications = asyncHandler(async (req, res) => {
    const notifications = await Notification.find({
        user: req.user._id

    }).sort({
        createdAt: -1
    });

    res.status(200).json({
        success: true,
        notifications
    });
});

export const markAsRead = asyncHandler(async (req, res) => {
    const notification = await Notification.findOne({
        _id: req.params.id,
        user: req.user._id
    });

    if (!notification) {
        throw new AppError(
            "Notification not found",
            404
        );
    }

    notification.isRead = true;
    await notification.save();

    res.status(200).json({
        success: true,
        notification
    });
});

export const deleteNotification = asyncHandler(async (req, res) => {
    await Notification.findOneAndDelete({
        _id: req.params.id,
        user: req.user._id
    });

    res.status(200).json({
        success: true,
        message: "Notification Deleted"
    });
});

export const markAllAsRead = asyncHandler(async (req, res) => {
    await Notification.updateMany(
        {
            user: req.user._id,
            isRead: false
        },

        {
            isRead: true
        }
    );

    res.status(200).json({
        success: true,
        message: "All notifications marked as read"
    });
});