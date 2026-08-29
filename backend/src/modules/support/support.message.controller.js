import asyncHandler from "../../core/http/asyncHandler.js";

import {
    sendSupportMessage
} from "./services/supportMessage.service.js";

export const sendStudentSupportMessage = asyncHandler(
    async (req, res) => {
        const {
            message,
            file
        } = req.body;

        const {
            conversationId
        } = req.params;

        const result = await sendSupportMessage({
            conversationId,
            user: req.user,
            message,
            file
        });

        return res.status(201).json({
            success: true,
            message: "Support message sent successfully.",
            data: result.message,
            autoReply: result.autoReply || null,
            escalated: Boolean(result.escalated),
            conversation: result.conversation
        });
    }
);
