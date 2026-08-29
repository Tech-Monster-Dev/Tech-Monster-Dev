import Notification from "../../notifications/models/Notification.js";

import {
    getIO,
    getOnlineUsers
} from "../../../infrastructure/socket/socket.js";

export const notifySupportReceiver = async ({
    receiver,
    sender,
    message,
    conversation,
    createNotification = true
}) => {
    let notification = null;

    if (createNotification) {
        notification =
            await Notification.create({
                user: receiver,
                title: "Support Message",
                message:
                    `${sender.firstName} sent you a support message.`,
                type: "message"
            });
    }

    const socketId =
        getOnlineUsers().get(
            receiver.toString()
        );

    if (!socketId) {
        return {
            delivered: false,
            notification
        };
    }

    message.delivered = true;

    await message.save();

    const target =
        getIO().to(socketId);

    target.emit(
        "supportMessage",
        message
    );

    target.emit(
        "supportConversationUpdated",
        conversation
    );

    if (notification) {
        target.emit(
            "newNotification",
            notification
        );
    }

    return {
        delivered: true,
        notification
    };
};
