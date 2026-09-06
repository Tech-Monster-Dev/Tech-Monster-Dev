import Message from "./models/Message.js";
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import Notification from "../notifications/models/Notification.js";
import User from "../user/models/User.js";
import Follow from "../follow/models/Follow.js";
import ChatMute from "./models/ChatMute.js";
import ChatBlock from "./models/ChatBlock.js";

import asyncHandler from "../../core/http/asyncHandler.js";
import AppError from "../../core/errors/AppError.js";
import logActivity from "../activity/logActivity.js";

import {
    getIO,
    getOnlineUsers,
    getOnlineUserActivity
} from "../../infrastructure/socket/socket.js";


// ==========================================================
// Toggle Chat Block
// ==========================================================

export const toggleChatBlock = asyncHandler(async (req, res) => {
    const userId = req.params.userId;
    const currentUserId = req.user._id.toString();

    if (userId == null || currentUserId === userId.toString()) {
        throw new AppError("Invalid user.", 400);
    }

    const user = await User.findById(userId).select("_id");

    if (!user) {
        throw new AppError("User not found.", 404);
    }

    const existingBlock = await ChatBlock.findOne({
        blocker: req.user._id,
        blockedUser: userId
    });

    if (existingBlock) {
        await existingBlock.deleteOne();

        getIO()
            .to(currentUserId)
            .emit("chatUsersUpdated", {
                type: "unblock",
                userId: userId.toString()
            });

        getIO()
            .to(userId.toString())
            .emit("chatUsersUpdated", {
                type: "unblock",
                userId: currentUserId
            });

        return res.status(200).json({
            success: true,
            blocked: false,
            message: "User unblocked."
        });
    }

    await ChatBlock.create({
        blocker: req.user._id,
        blockedUser: userId
    });

    await Follow.deleteMany({
        $or: [
            {
                follower: req.user._id,
                following: userId
            },
            {
                follower: userId,
                following: req.user._id
            }
        ]
    });

    getIO()
        .to(currentUserId)
        .emit("chatUsersUpdated", {
            type: "block",
            userId: userId.toString()
        });

    getIO()
        .to(userId.toString())
        .emit("chatUsersUpdated", {
            type: "blockedBy",
            userId: currentUserId
        });

    return res.status(200).json({
        success: true,
        blocked: true,
        message: "User blocked."
    });
});


// ==========================================================
// Get Blocked Users
// ==========================================================

export const getBlockedUsers = asyncHandler(async (req, res) => {
    const blockedUsers = await ChatBlock.find({
        blocker: req.user._id
    })
        .populate(
            "blockedUser",
            "_id firstName lastName username avatar email"
        )
        .sort({ createdAt: -1 });

    const users = blockedUsers
        .filter((block) => block.blockedUser)
        .map((block) => ({
            _id: block.blockedUser._id,
            firstName: block.blockedUser.firstName,
            lastName: block.blockedUser.lastName,
            username: block.blockedUser.username,
            profileImage: block.blockedUser.avatar,
            email: block.blockedUser.email
        }));

    return res.status(200).json({
        success: true,
        users
    });
});


// ==========================================================
// Send Message
// ==========================================================

export const sendMessage = asyncHandler(async (req, res) => {

    const {

        receiver,

        message,

        file,

        replyTo

    } = req.body;

    if (!receiver) {

        throw new AppError(
            "Receiver is required.",
            400
        );

    }

    if (!message && !file) {

        throw new AppError(
            "Message or File is required.",
            400
        );

    }

    const receiverUser = await User.findById(receiver);

    const isBlocked = await ChatBlock.exists({
        $or: [
            {
                blocker: req.user._id,
                blockedUser: receiver
            },
            {
                blocker: receiver,
                blockedUser: req.user._id
            }
        ]
    });

    if (isBlocked) {
        throw new AppError(
            "You cannot send messages because this user is blocked.",
            403
        );
    }

    if (!receiverUser) {

        throw new AppError(
            "Receiver not found.",
            404
        );

    }

    const newMessage = await Message.create({

        sender: req.user._id,

        receiver,

        message,

        file,

        replyTo,

        seen: receiver.toString() === req.user._id.toString()

    });

    await newMessage.populate(
        "sender",
        "firstName lastName profileImage"
    );

    await newMessage.populate(
        "receiver",
        "firstName lastName profileImage"
    );

    await newMessage.populate({

        path: "replyTo",

        populate: {

            path: "sender",

            select: "firstName lastName profileImage"

        }

    });

    // ==========================
    // Notification
    // ==========================

    let notification = null;

    if (receiver.toString() !== req.user._id.toString() && !(await ChatMute.exists({ user: receiver, mutedUser: req.user._id }))) {

        notification = await Notification.create({

            user: receiver,

            title: "New Message",

            message: `${req.user.firstName} sent you a message.`,

            type: "message"

        });

    }

    getIO().to(receiver.toString()).emit(
        "chatUsersUpdated",
        { type: "message", userId: req.user._id.toString() }
    );

    getIO().to(req.user._id.toString()).emit(
        "chatUsersUpdated",
        { type: "message", userId: receiver.toString() }
    );

    const onlineUsers = getOnlineUsers();

    const receiverSocketId = onlineUsers.get(
        receiver.toString()
    );

    if (receiverSocketId) {

        newMessage.delivered = true;

        await newMessage.save();

        getIO().to(receiverSocketId).emit(

            "receiveMessage",

            newMessage

        );

        if (notification) {

            getIO().to(receiverSocketId).emit(

                "newNotification",

                notification

            );

        }

    }

    await logActivity(

        req,

        req.user._id,

        "SEND_MESSAGE",

        "Message",

        `Sent message to ${receiverUser.firstName}`

    );

    return res.status(201).json({

        success: true,

        message: "Message sent successfully.",

        data: newMessage

    });

});


// ==========================================================
// Get Conversation
// ==========================================================

export const getMessages = asyncHandler(async (req, res) => {

    const { userId } = req.params;

    const messages = await Message.find({

        $or: [

            {

                sender: req.user._id,

                receiver: userId

            },

            {

                sender: userId,

                receiver: req.user._id

            }

        ]

    })

        .populate(
            "sender",
            "firstName lastName profileImage"
        )

        .populate(
            "receiver",
            "firstName lastName profileImage"
        )

        .populate({

            path: "replyTo",

            populate: {

                path: "sender",

                select: "firstName lastName profileImage"

            }

        })

        .sort({

            createdAt: 1

        });

    const filteredMessages = messages.filter(

        msg =>

            !msg.deletedFor.some(

                user =>

                    user.toString() ===

                    req.user._id.toString()

            )

    );

    return res.status(200).json({

        success: true,

        messages: filteredMessages

    });

});


// ==========================================================
// Chat Users List with Last Message + Unread Count
// ==========================================================

export const getChatUsers = asyncHandler(async (req, res) => {

    const following = await Follow.find({
        follower: req.user._id
    }).select("following");

    const followingIds = following.map(
        follow => follow.following.toString()
    );

    const blockedUsers = await ChatBlock.find({
        $or: [
            { blocker: req.user._id },
            { blockedUser: req.user._id }
        ]
    }).select("blocker blockedUser");

    const blockedUserIds = blockedUsers.map((block) =>
        block.blocker.toString() === req.user._id.toString()
            ? block.blockedUser.toString()
            : block.blocker.toString()
    );

    const existingChats = await Message.find({
        $or: [
            { sender: req.user._id },
            { receiver: req.user._id }
        ],
        deletedFor: { $ne: req.user._id },
    }).select("sender receiver");

    const existingChatIds = new Set();

    existingChats.forEach((chat) => {
        const otherUserId =
            chat.sender.toString() === req.user._id.toString()
                ? chat.receiver.toString()
                : chat.sender.toString();

        existingChatIds.add(otherUserId);
    });

    let fallbackAdminId = null;

    if (req.user.role === "student" && followingIds.length === 0) {
        const onlineUsers = getOnlineUsers();
        const onlineUserActivity = getOnlineUserActivity();

        const onlineAdminIds = Array.from(onlineUsers.keys()).filter(
            userId => onlineUserActivity.has(userId)
        );

        if (onlineAdminIds.length > 0) {
            const onlineAdmins = await User.find({
                _id: { $in: onlineAdminIds },
                role: "admin",
                isBlocked: false
            }).select("_id");

            fallbackAdminId = onlineAdmins
                .sort(
                    (a, b) =>
                        (onlineUserActivity.get(b._id.toString()) || 0) -
                        (onlineUserActivity.get(a._id.toString()) || 0)
                )[0]?._id?.toString() || null;
        }
    }

    const users = await User.find({

        isBlocked: false,
        _id: { $nin: blockedUserIds },

        ...(req.user.role === "student"
            ? {
                $or: [
                    { _id: req.user._id },
                    { _id: { $in: followingIds } },
                    { _id: { $in: Array.from(existingChatIds) }, role: "admin" },
                    ...(fallbackAdminId ? [{ _id: fallbackAdminId, role: "admin" }] : [])
                ]
            }
            : {
                _id: { $ne: req.user._id }
            })

    })

        .select(

            "username firstName middleName lastName email avatar role bio gender dateOfBirth education college branch year semester github linkedin skills currentAddress localAddress district state pincode createdAt lastLogin"

        )

        .sort({

            firstName: 1

        });

    const chatUsers = await Promise.all(

        users.map(async (user) => {

            // Last Message

            const lastMessage = await Message.findOne({

                $or: [

                    {

                        sender: req.user._id,

                        receiver: user._id

                    },

                    {

                        sender: user._id,

                        receiver: req.user._id

                    }

                ],
                deletedFor: { $ne: req.user._id }

            })

                .sort({

                    createdAt: -1

                });

            // Unread Count

            const unreadCount = await Message.countDocuments({

                sender: user._id,

                receiver: req.user._id,

                seen: false

            });

            return {

                _id: user._id,

                username: user.username,

                firstName: user.firstName,

                middleName: user.middleName,

                lastName: user.lastName,

                email: user.email,

                role: user.role,

                avatar: user.avatar,

                bio: user.bio,

                gender: user.gender,

                dateOfBirth: user.dateOfBirth,

                education: user.education,

                college: user.college,

                branch: user.branch,

                year: user.year,

                semester: user.semester,

                github: user.github,

                linkedin: user.linkedin,

                skills: user.skills,

                currentAddress: user.currentAddress,

                localAddress: user.localAddress,

                district: user.district,

                state: user.state,

                pincode: user.pincode,

                createdAt: user.createdAt,

                lastLogin: user.lastLogin,

                unreadCount,

                lastMessage: lastMessage

                    ? {

                        text:

                            lastMessage.message ||

                            "📎 Attachment",

                        createdAt:

                            lastMessage.createdAt

                    }

                    : null

            };

        })

    );

    return res.status(200).json({

        success: true,

        users: chatUsers

    });

});


// ==========================================================
// Mark Messages Seen
// ==========================================================

export const markAsSeen = asyncHandler(async (req, res) => {

    const { userId } = req.params;

    await Message.updateMany(

        {

            sender: userId,

            receiver: req.user._id,

            seen: false

        },

        {

            seen: true,

            delivered: true

        }

    );

    const senderSocketId = getOnlineUsers().get(

        userId.toString()

    );

    if (senderSocketId) {

        getIO().to(senderSocketId).emit(

            "messagesSeen",

            {

                by: req.user._id

            }

        );

    }

    return res.status(200).json({

        success: true

    });

});


// ==========================================================
// Delete For Me
// ==========================================================

export const deleteForMe = asyncHandler(async (req, res) => {

    const { id } = req.params;

    const message = await Message.findById(id);

    if (!message) {

        throw new AppError(

            "Message not found",

            404

        );

    }

    const alreadyDeleted = message.deletedFor.some(

        user =>

            user.toString() ===

            req.user._id.toString()

    );

    if (!alreadyDeleted) {

        message.deletedFor.push(

            req.user._id

        );

        await message.save();

    }

    return res.status(200).json({

        success: true,

        message: "Message deleted for you."

    });

});


// ==========================================================
// Delete For Everyone
// ==========================================================

export const deleteForEveryone = asyncHandler(async (req, res) => {

    const { id } = req.params;

    const message = await Message.findById(id);

    if (!message) {

        throw new AppError(

            "Message not found",

            404

        );

    }

    if (

        message.sender.toString() !==

        req.user._id.toString()

    ) {

        throw new AppError(

            "Only sender can delete for everyone.",

            403

        );

    }

    message.message = "";

    message.file = "";

    message.isDeleted = true;

    await message.save();

    const receiverSocketId = getOnlineUsers().get(

        message.receiver.toString()

    );

    if (receiverSocketId) {

        getIO()

            .to(receiverSocketId)

            .emit(

                "messageDeleted",

                {

                    messageId: message._id

                }

            );

    }

    return res.status(200).json({

        success: true,

        message: "Message deleted for everyone."

    });

});


// ==========================================================
// Search Messages
// ==========================================================

export const searchMessages = asyncHandler(async (req, res) => {

    const { userId } = req.params;

    const { keyword } = req.query;

    if (!keyword) {

        return res.status(200).json({

            success: true,

            messages: [],

            messages: []

        });

    }

    const messages = await Message.find({

        $or: [

            {

                sender: req.user._id,

                receiver: userId

            },

            {

                sender: userId,

                receiver: req.user._id

            }

        ],

        message: {

            $regex: keyword,

            $options: "i"

        },

        deletedFor: { $ne: req.user._id }

    })

        .populate(

            "sender",

            "firstName lastName profileImage"

        )

        .populate(

            "receiver",

            "firstName lastName profileImage"

        )

        .populate({

            path: "replyTo",

            populate: {

                path: "sender",

                select: "firstName lastName profileImage"

            }

        })

        .sort({

            createdAt: 1

        });

    return res.status(200).json({

        success: true,

        messages

    });

});


// ==========================================================
// Star / Unstar Message For Me
// ==========================================================

export const toggleStarMessage = asyncHandler(async (req, res) => {

    const { id } = req.params;

    if (!id) {
        throw new AppError("Message is required.", 400);
    }

    const message = await Message.findById(id);

    if (!message) {
        throw new AppError("Message not found.", 404);
    }

    const userId = req.user._id.toString();
    const alreadyStarred = message.starredBy.some(
        user => user.toString() === userId
    );

    if (alreadyStarred) {
        message.starredBy = message.starredBy.filter(
            user => user.toString() !== userId
        );
    } else {
        message.starredBy.push(req.user._id);
    }

    await message.save();

    return res.status(200).json({
        success: true,
        starred: !alreadyStarred,
        message: alreadyStarred ? "Message unstarred." : "Message starred."
    });
});


// ==========================================================
// Delete Conversation For Me
// ==========================================================

export const deleteConversationForMe = asyncHandler(async (req, res) => {

    const { userId } = req.params;

    if (!userId) {
        throw new AppError("User is required.", 400);
    }

    await Message.updateMany(
        {
            $or: [
                { sender: req.user._id, receiver: userId },
                { sender: userId, receiver: req.user._id }
            ],
            deletedFor: { $ne: req.user._id }
        },
        {
            $addToSet: { deletedFor: req.user._id }
        }
    );

    getIO().to(req.user._id.toString()).emit(
        "chatUsersUpdated",
        { type: "conversationDeleted", userId: userId.toString() }
    );

    return res.status(200).json({
        success: true,
        message: "Conversation deleted for you."
    });
});


// ==========================================================
// Get Starred Messages
// ==========================================================

export const getStarredMessages = asyncHandler(async (req, res) => {

    const { userId } = req.params;

    const messages = await Message.find({
        $or: [
            { sender: req.user._id, receiver: userId },
            { sender: userId, receiver: req.user._id }
        ],
        starredBy: req.user._id,
        deletedFor: { $ne: req.user._id }
    })
        .populate("sender", "firstName lastName username avatar role")
        .populate("receiver", "firstName lastName username avatar role")
        .populate({
            path: "replyTo",
            populate: {
                path: "sender",
                select: "firstName lastName username avatar"
            }
        })
        .sort({ createdAt: 1 });

    return res.status(200).json({
        success: true,
        messages
    });
});


// ==========================================================
// Get Messages with Pagination
// ==========================================================

export const getMessagesPaginated = asyncHandler(async (req, res) => {

    const { userId } = req.params;

    const page = Number(req.query.page) || 1;

    const limit = 20;

    const skip = (page - 1) * limit;

    const messages = await Message.find({

        $or: [

            {
                sender: req.user._id,
                receiver: userId
            },

            {
                sender: userId,
                receiver: req.user._id
            }

        ],

        deletedFor: { $ne: req.user._id }

    })

        .populate(
            "sender",
            "firstName lastName profileImage"
        )

        .populate(
            "receiver",
            "firstName lastName profileImage"
        )

        .populate({

            path: "replyTo",

            populate: {

                path: "sender",

                select: "firstName lastName profileImage"

            }

        })

        .sort({

            createdAt: -1

        })

        .skip(skip)

        .limit(limit);

    const blocked = await ChatBlock.exists({
        blocker: req.user._id,
        blockedUser: userId
    });

    const blockedBy = await ChatBlock.exists({
        blocker: userId,
        blockedUser: req.user._id
    });

    res.status(200).json({
        success: true,
        messages: messages.reverse(),
        hasMore: messages.length === limit,
        blocked: Boolean(blocked),
        blockedBy: Boolean(blockedBy)
    });

});

// ==========================================================
// Export Chat as PDF
// ==========================================================

export const exportChat = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    if (typeof userId !== "string" || userId.length === 0) {
        throw new AppError("User is required.", 400);
    }

    const otherUser = await User.findById(userId).select(
        "firstName lastName username email"
    );

    if (!otherUser) {
        throw new AppError("User not found.", 404);
    }

    const messages = await Message.find({
        $or: [
            {
                sender: req.user._id,
                receiver: userId
            },
            {
                sender: userId,
                receiver: req.user._id
            }
        ],
        deletedFor: { $ne: req.user._id }
    })
        .populate("sender", "firstName lastName username")
        .sort({ createdAt: 1 });

    const exportDir = path.join(process.cwd(), "uploads", "chat");

    if (!fs.existsSync(exportDir)) {
        fs.mkdirSync(exportDir, { recursive: true });
    }

    const fileName = `Chat-${req.user._id}-${userId}-${Date.now()}.pdf`;
    const filePath = path.join(exportDir, fileName);

    const doc = new PDFDocument({
        size: "A4",
        margin: 50
    });

    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    const getName = (user) =>
        `${user?.firstName || ""} ${user?.lastName || ""}`.trim() ||
        user?.username ||
        "User";

    doc
        .fontSize(22)
        .text("TECH MONSTER", { align: "center" });

    doc.moveDown(0.5);

    doc
        .fontSize(16)
        .text("Chat Export", { align: "center" });

    doc.moveDown();

    doc
        .fontSize(11)
        .text(`Conversation between ${getName(req.user)} and ${getName(otherUser)}`, {
            align: "center"
        });

    doc.moveDown(2);

    if (messages.length === 0) {
        doc
            .fontSize(12)
            .text("No messages found in this conversation.", {
                align: "center"
            });
    } else {
        messages.forEach((item, index) => {
            const senderName = getName(item.sender);
            const dateTime = new Date(item.createdAt).toLocaleString("en-IN", {
                dateStyle: "medium",
                timeStyle: "short"
            });

            doc
                .fontSize(11)
                .fillColor("#222222")
                .text(`${senderName}  •  ${dateTime}`);

            doc
                .fontSize(10)
                .fillColor("#555555")
                .text(
                    item.isDeleted
                        ? "This message was deleted."
                        : item.message || "Message"
                );

            if (index < messages.length - 1) {
                doc.moveDown(0.8);
                doc
                    .moveTo(50, doc.y)
                    .lineTo(545, doc.y)
                    .strokeColor("#dddddd")
                    .stroke();
                doc.moveDown(0.8);
            }
        });
    }

    doc.end();

    stream.on("finish", () => {
        res.download(filePath, fileName, (error) => {
            fs.unlink(filePath, () => { });

            if (error && !res.headersSent) {
                res.status(500).json({
                    success: false,
                    message: "Failed to download chat export."
                });
            }
        });
    });

    stream.on("error", () => {
        if (!res.headersSent) {
            res.status(500).json({
                success: false,
                message: "Failed to generate chat export."
            });
        }
    });
});

// ==========================================================
// Mute / Unmute Chat
// ==========================================================

export const toggleChatMute = asyncHandler(async (req, res) => {
    const userId = req.params.userId;
    if (typeof userId !== "string" || userId.length === 0) {
        throw new AppError("User is required.", 400);
    }

    const user = await User.findById(userId).select("_id");
    if (!user) {
        throw new AppError("User not found.", 404);
    }

    const existingMute = await ChatMute.findOne({
        user: req.user._id,
        mutedUser: userId
    });

    if (existingMute) {
        await existingMute.deleteOne();
        return res.status(200).json({
            success: true,
            muted: false,
            message: "Chat unmuted."
        });
    }

    await ChatMute.create({
        user: req.user._id,
        mutedUser: userId
    });

    return res.status(200).json({
        success: true,
        muted: true,
        message: "Chat muted."
    });
});

export const getMutedChats = asyncHandler(async (req, res) => {
    const mutedChats = await ChatMute.find({
        user: req.user._id
    }).select("mutedUser");

    return res.status(200).json({
        success: true,
        mutedUsers: mutedChats.map(item => item.mutedUser.toString())
    });
});
