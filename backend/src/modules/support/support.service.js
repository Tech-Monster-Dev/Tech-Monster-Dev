import SupportConversation from "./models/SupportConversation.js";
import Message from "../messages/models/Message.js";
import User from "../user/models/User.js";
import AppError from "../../core/errors/AppError.js";

export const getOrCreateConversation = async (studentId) => {
    const student = await User.findOne({
        _id: studentId,
        role: "student",
        isBlocked: false
    }).select("_id firstName lastName email avatar");

    if (!student) {
        throw new AppError("Student not found.", 404);
    }

    return SupportConversation.findOneAndUpdate(
        { student: studentId },
        { $setOnInsert: { student: studentId } },
        { new: true, upsert: true }
    )
        .populate(
            "student",
            "firstName lastName email avatar"
        )
        .populate(
            "assignedAdmin",
            "firstName lastName email avatar"
        );
};

export const getSupportInbox = async () => {
    return SupportConversation.find()
        .populate(
            "student",
            "firstName lastName email avatar"
        )
        .populate(
            "assignedAdmin",
            "firstName lastName email avatar"
        )
        .populate(
            "lastMessage",
            "sender receiver message file createdAt"
        )
        .sort({
            unreadForAdmin: -1,
            lastMessageAt: -1,
            createdAt: -1
        });
};

export const getConversationMessages = async (
    conversationId,
    user
) => {
    const conversation =
        await SupportConversation.findById(
            conversationId
        );

    if (!conversation) {
        throw new AppError(
            "Support conversation not found.",
            404
        );
    }

    const isAdmin = user.role === "admin";
    const isStudent =
        conversation.student.toString() ===
        user._id.toString();

    if (!isAdmin && !isStudent) {
        throw new AppError(
            "Access denied.",
            403
        );
    }

    if (isAdmin) {
        conversation.unreadForAdmin = 0;
    } else {
        conversation.unreadForStudent = 0;
    }

    await conversation.save();

    return Message.find({
        supportConversation: conversationId
    })
        .populate(
            "sender",
            "firstName lastName avatar role"
        )
        .populate(
            "receiver",
            "firstName lastName avatar role"
        )
        .sort({
            createdAt: 1
        });
};

export const clearSupportConversation = async (
    conversationId,
    studentId
) => {
    const conversation =
        await SupportConversation.findOne({
            _id: conversationId,
            student: studentId
        });

    if (!conversation) {
        throw new AppError(
            "Support conversation not found.",
            404
        );
    }

    await Message.deleteMany({
        supportConversation: conversation._id
    });

    await SupportConversation.deleteOne({
        _id: conversation._id
    });

    return {
        cleared: true
    };
};

export const updateConversationState = async (
    conversationId,
    updates
) => {
    const allowed = [
        "status",
        "assignedAdmin"
    ];

    const data = {};

    allowed.forEach((key) => {
        if (updates[key] !== undefined) {
            data[key] = updates[key];
        }
    });

    if (
        data.assignedAdmin &&
        !await User.exists({
            _id: data.assignedAdmin,
            role: "admin",
            isBlocked: false
        })
    ) {
        throw new AppError(
            "Admin not found.",
            404
        );
    }

    return SupportConversation.findByIdAndUpdate(
        conversationId,
        { $set: data },
        {
            new: true,
            runValidators: true
        }
    )
        .populate(
            "student",
            "firstName lastName email avatar"
        )
        .populate(
            "assignedAdmin",
            "firstName lastName email avatar"
        );
};
