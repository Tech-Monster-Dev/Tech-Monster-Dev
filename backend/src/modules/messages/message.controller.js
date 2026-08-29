import Message from "./models/Message.js";
import Notification from "../notifications/models/Notification.js";
import User from "../user/models/User.js";

import asyncHandler from "../../core/http/asyncHandler.js";
import AppError from "../../core/errors/AppError.js";
import logActivity from "../activity/logActivity.js";

import {
    getIO,
    getOnlineUsers
} from "../../infrastructure/socket/socket.js";


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

    if (!receiverUser) {

        throw new AppError(
            "Receiver not found.",
            404
        );

    }

    if (receiver === req.user._id.toString()) {

        throw new AppError(
            "You cannot message yourself.",
            400
        );

    }

    const newMessage = await Message.create({

        sender: req.user._id,

        receiver,

        message,

        file,

        replyTo,

        seen: false

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

    const notification = await Notification.create({

        user: receiver,

        title: "New Message",

        message: `${req.user.firstName} sent you a message.`,

        type: "message"

    });

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

        getIO().to(receiverSocketId).emit(

            "newNotification",

            notification

        );

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

    const users = await User.find({

        _id: {

            $ne: req.user._id

        },

        isBlocked: false

    })

        .select(

            "firstName lastName email avatar role"

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

                ]

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

                firstName: user.firstName,

                lastName: user.lastName,

                email: user.email,

                role: user.role,

                avatar: user.avatar,

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

        }

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
// Shared Media & Files
// ==========================================================

export const getSharedFiles = asyncHandler(async (req, res) => {

    const { userId } = req.params;

    const files = await Message.find({

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

        file: {

            $ne: ""

        }

    })

    .populate(
        "sender",
        "firstName lastName profileImage"
    )

    .sort({

        createdAt: -1

    });

    return res.status(200).json({

        success: true,

        files

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

            createdAt: -1

        })

        .skip(skip)

        .limit(limit);

    res.status(200).json({

        success: true,

        messages: messages.reverse(),

        hasMore: messages.length === limit

    });

});