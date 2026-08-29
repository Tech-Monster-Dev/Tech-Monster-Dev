import asyncHandler from "../../core/http/asyncHandler.js";

import {
    getOrCreateConversation,
    getSupportInbox,
    getConversationMessages,
    updateConversationState,
    clearSupportConversation
} from "./support.service.js";

export const getMySupportConversation = asyncHandler(
    async (req, res) => {
        const conversation =
            await getOrCreateConversation(
                req.user._id
            );

        return res.status(200).json({
            success: true,
            conversation
        });
    }
);

export const getAdminSupportInbox = asyncHandler(
    async (req, res) => {
        const conversations =
            await getSupportInbox();

        return res.status(200).json({
            success: true,
            conversations
        });
    }
);

export const getSupportMessages = asyncHandler(
    async (req, res) => {
        const { conversationId } =
            req.params;

        const messages =
            await getConversationMessages(
                conversationId,
                req.user
            );

        return res.status(200).json({
            success: true,
            messages
        });
    }
);

export const clearMySupportConversation = asyncHandler(
    async (req, res) => {
        const { conversationId } =
            req.params;

        const result =
            await clearSupportConversation(
                conversationId,
                req.user._id
            );

        return res.status(200).json({
            success: true,
            message: "Support chat cleared successfully.",
            ...result
        });
    }
);

export const updateSupportConversation =
    asyncHandler(async (req, res) => {
        const { conversationId } =
            req.params;

        const conversation =
            await updateConversationState(
                conversationId,
                req.body
            );

        return res.status(200).json({
            success: true,
            conversation
        });
    });
