import Message from "../../messages/models/Message.js";
import AppError from "../../../core/errors/AppError.js";

export const validateSupportAccess = (
    conversation,
    user
) => {
    const isStudent =
        conversation.student.toString() ===
        user._id.toString();

    const isAdmin =
        user.role === "admin";

    if (!isStudent && !isAdmin) {
        throw new AppError(
            "Access denied.",
            403
        );
    }

    return {
        isStudent,
        isAdmin
    };
};

export const createSupportMessage = async ({
    conversation,
    user,
    receiver,
    message,
    file
}) => {
    const newMessage =
        await Message.create({
            sender: user._id,
            receiver,
            message: message?.trim() || "",
            file,
            supportConversation:
                conversation._id,
            seen: false
        });

    await newMessage.populate(
        "sender",
        "firstName lastName avatar role"
    );

    await newMessage.populate(
        "receiver",
        "firstName lastName avatar role"
    );

    return newMessage;
};

export const updateSupportConversation =
    async ({
        conversation,
        messageId,
        isStudent
    }) => {
        conversation.lastMessage =
            messageId;

        conversation.lastMessageAt =
            new Date();

        if (isStudent) {
            conversation.unreadForAdmin += 1;
            conversation.status = "open";
        } else {
            conversation.unreadForStudent += 1;
        }

        await conversation.save();

        return conversation;
    };
