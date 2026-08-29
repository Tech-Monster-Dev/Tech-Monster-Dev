import SupportConversation from "../models/SupportConversation.js";
import AppError from "../../../core/errors/AppError.js";

import {
    assignSupportAdmin
} from "./supportAssignment.service.js";

import {
    validateSupportAccess,
    createSupportMessage,
    updateSupportConversation
} from "./supportMessage.helper.js";

import {
    notifySupportReceiver
} from "./supportNotification.service.js";

import {
    sendSupportAutoReply
} from "./supportAutoReply.service.js";

export const sendSupportMessage = async ({
    conversationId,
    user,
    message,
    file = ""
}) => {
    if (!message?.trim() && !file) {
        throw new AppError(
            "Message or File is required.",
            400
        );
    }

    let conversation =
        await SupportConversation.findById(
            conversationId
        );

    if (!conversation) {
        throw new AppError(
            "Support conversation not found.",
            404
        );
    }

    const {
        isStudent,
        isAdmin
    } = validateSupportAccess(
        conversation,
        user
    );

    if (
        isStudent &&
        !conversation.assignedAdmin
    ) {
        conversation =
            await assignSupportAdmin(
                conversation._id
            );
    }

    const receiver = isStudent
        ? conversation.assignedAdmin
        : conversation.student;

    if (!receiver) {
        throw new AppError(
            "Support receiver not found.",
            409
        );
    }

    const newMessage =
        await createSupportMessage({
            conversation,
            user,
            receiver,
            message,
            file
        });

    conversation =
        await updateSupportConversation({
            conversation,
            messageId: newMessage._id,
            isStudent
        });

    /*
     * ADMIN -> STUDENT
     *
     * Real admin replies always notify
     * the student.
     */
    if (isAdmin) {
        await notifySupportReceiver({
            receiver,
            sender: user,
            message: newMessage,
            conversation,
            createNotification: true
        });

        return {
            message: newMessage,
            conversation
        };
    }

    /*
     * STUDENT -> SUPPORT
     *
     * Do not notify admin immediately.
     * First check the local knowledge base.
     */
    const autoReply =
        await sendSupportAutoReply({
            conversation,
            student: user,
            question: message,
            studentMessage: newMessage
        });

    return {
        message: newMessage,
        conversation:
            autoReply?.conversation ||
            conversation,
        autoReply:
            autoReply?.message || null,
        escalated:
            Boolean(
                autoReply?.escalated
            )
    };
};
