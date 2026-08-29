import mongoose from "mongoose";

const supportConversationSchema = new mongoose.Schema(
    {
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true
        },

        assignedAdmin: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },

        status: {
            type: String,
            enum: ["open", "pending", "resolved"],
            default: "open"
        },

        unreadForAdmin: {
            type: Number,
            default: 0,
            min: 0
        },

        unreadForStudent: {
            type: Number,
            default: 0,
            min: 0
        },

        lastMessage: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Message",
            default: null
        },

        lastMessageAt: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

supportConversationSchema.index({
    status: 1,
    lastMessageAt: -1
});

supportConversationSchema.index({
    assignedAdmin: 1,
    status: 1,
    lastMessageAt: -1
});

export default mongoose.model(
    "SupportConversation",
    supportConversationSchema
);
