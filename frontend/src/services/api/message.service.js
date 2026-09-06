import api from "./axios";
import { API } from "./endpoints";

// Get all chat users
export const getChatUsers = async () => {
    const { data } = await api.get(API.MESSAGE.USERS);
    return data;
};

// Get conversation
export const getMessages = async (userId) => {
    const { data } = await api.get(`${API.MESSAGE.BASE}/${userId}`);
    return data;
};

// Send message
export const sendMessage = async (payload) => {
    const { data } = await api.post(API.MESSAGE.BASE, payload);
    return data;
};

// Mark seen
export const markAsSeen = async (userId) => {
    const { data } = await api.patch(
        `${API.MESSAGE.BASE}/seen/${userId}`
    );
    return data;
};



// Delete Conversation For Me
export const deleteConversationForMe = async (userId) => {

    const { data } = await api.delete(

        `${API.MESSAGE.BASE}/conversation/${userId}`

    );

    return data;

};


// Delete for Me
export const deleteForMe = async (id) => {

    const { data } = await api.delete(

        `${API.MESSAGE.BASE}/me/${id}`

    );

    return data;

};

// Delete for Everyone
export const deleteForEveryone = async (id) => {

    const { data } = await api.delete(

        `${API.MESSAGE.BASE}/everyone/${id}`

    );

    return data;

};


export const searchMessages = async (

    userId,

    keyword

) => {

    const { data } = await api.get(

        `${API.MESSAGE.BASE}/search/${userId}?keyword=${keyword}`

    );

    return data;

};


export const getMessagesPage = async (

    userId,

    page

) => {

    const { data } = await api.get(

        `${API.MESSAGE.BASE}/page/${userId}?page=${page}`

    );

    return data;

};
export const toggleStarMessage = async (messageId) => {
    const { data } = await api.patch(`${API.MESSAGE.BASE}/star/${messageId}`);
    return data;
};


export const getStarredMessages = async (userId) => {
    const { data } = await api.get(`${API.MESSAGE.BASE}/starred/${userId}`);
    return data;
};


export const toggleChatMute = async (userId) => {
    const { data } = await api.patch(
        `${API.MESSAGE.BASE}/mute/${userId}`
    );
    return data;
};

export const toggleChatBlock = async (userId) => {
    const { data } = await api.patch(
        `${API.MESSAGE.BASE}/block/${userId}`
    );
    return data;
};

export const getBlockedUsers = async () => {
    const { data } = await api.get(API.MESSAGE.BASE + "/blocked");
    return data;
};


export const getMutedChats = async () => {
    const { data } = await api.get(
        `${API.MESSAGE.BASE}/muted`
    );
    return data;
};


export const exportChat = async (userId) => {
    const response = await api.get(`${API.MESSAGE.BASE}/export/${userId}`, {
        responseType: "blob"
    });
    return response;
};
