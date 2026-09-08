import Notice from "./models/Notice.js";

import asyncHandler from "../../core/http/asyncHandler.js";
import AppError from "../../core/errors/AppError.js";
import { getIO } from "../../infrastructure/socket/socket.js";

import cloudinary from "../../infrastructure/storage/cloudinary.js";
import streamifier from "streamifier";

const uploadToCloudinary = (fileBuffer) =>
    new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder: "tech_monster_notices" },
            (error, result) => {
                if (result) {
                    resolve(result);
                } else {
                    reject(error);
                }
            }
        );

        streamifier
            .createReadStream(fileBuffer)
            .pipe(stream);
    });

export const createNotice = asyncHandler(async (req, res) => {
    const {
        shortTitle,
        subject,
        description
    } = req.body || {};

    const noticeData = {
        shortTitle,
        subject,
        description
    };

    if (req.file) {
        const cloudinaryResponse = await uploadToCloudinary(
            req.file.buffer
        );

        noticeData.image = cloudinaryResponse.secure_url;
    }

    const notice = await Notice.create(noticeData);

    const io = getIO();
    io.emit("noticeCreated", { notice });

    res.status(201).json({
        success: true,
        message: "Notice created successfully",
        notice
    });
});

export const getAllNotices = asyncHandler(async (req, res) => {
    const notices = await Notice.find()
        .sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        notices
    });
});

export const updateNotice = asyncHandler(async (req, res) => {
    const {
        shortTitle,
        subject,
        description
    } = req.body || {};

    let notice = await Notice.findById(req.params.id);

    if (!notice) {
        throw new AppError("Notice not found", 404);
    }

    let image = notice.image;

    if (req.file) {
        const cloudinaryResponse = await uploadToCloudinary(
            req.file.buffer
        );

        image = cloudinaryResponse.secure_url;
    }

    notice = await Notice.findByIdAndUpdate(
        req.params.id,
        {
            shortTitle:
                shortTitle !== undefined
                    ? shortTitle
                    : notice.shortTitle,

            subject:
                subject !== undefined
                    ? subject
                    : notice.subject,

            description:
                description !== undefined
                    ? description
                    : notice.description,

            image
        },
        {
            new: true,
            runValidators: true
        }
    );

    const io = getIO();
    io.emit("noticeUpdated", { notice });

    res.status(200).json({
        success: true,
        message: "Notice updated successfully",
        notice
    });
});

export const deleteNotice = asyncHandler(async (req, res) => {
    const notice = await Notice.findById(req.params.id);

    if (!notice) {
        throw new AppError("Notice not found", 404);
    }

    await Notice.findByIdAndDelete(req.params.id);

    const io = getIO();
    io.emit("noticeDeleted", {
        noticeId: String(req.params.id)
    });

    res.status(200).json({
        success: true,
        message: "Notice deleted successfully"
    });
});
