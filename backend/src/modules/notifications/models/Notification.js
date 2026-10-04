import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },

        title: {
            type: String,
            required: true
        },

        message: {
            type: String,
            required: true
        },

        type: {
            type: String,
            enum: [
                "certificate",
                "message",
                "follow",
                "system"
            ],
            default: "system"
        },

        context: {
            type: mongoose.Schema.Types.Mixed,
            default: null
        },

        isRead: {
            type: Boolean,
            default: false
        }
    },

    {
        timestamps: true
    }
);

export default mongoose.model(
    "Notification",
    notificationSchema
);