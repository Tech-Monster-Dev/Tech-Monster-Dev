import api from "./axios";
import { API } from "./endpoints";

// Get / create the logged-in student's support conversation
export const getMySupportConversation = async () => {
    const { data } = await api.get(
        API.SUPPORT.CONVERSATION
    );

    return data;
};

// Get all support conversations for admin
export const getSupportInbox = async () => {
    const { data } = await api.get(
        API.SUPPORT.INBOX
    );

    return data;
};

// Get messages of a support conversation
export const getSupportMessages = async (
    conversationId
) => {
    const { data } = await api.get(
        API.SUPPORT.MESSAGES(conversationId)
    );

    return data;
};

// Send a support message
export const sendSupportMessage = async ({
    conversationId,
    message,
    file = ""
}) => {
    const { data } = await api.post(
        API.SUPPORT.MESSAGES(conversationId),
        {
            conversationId,
            message,
            file
        }
    );

    return data;
};

// Clear the logged-in student support conversation
export const clearSupportConversation = async (
    conversationId
) => {
    const { data } = await api.delete(
        API.SUPPORT.CONVERSATION_BY_ID(
            conversationId
        )
    );

    return data;
};

// Update support conversation
export const updateSupportConversation = async (
    conversationId,
    payload
) => {
    const { data } = await api.patch(
        API.SUPPORT.UPDATE_CONVERSATION(
            conversationId
        ),
        payload
    );

    return data;
};
