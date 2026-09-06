import mongoose from "mongoose";

const chatMuteSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        mutedUser: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    },
    { timestamps: true }
);

chatMuteSchema.index({ user: 1, mutedUser: 1 }, { unique: true });

export default mongoose.model("ChatMute", chatMuteSchema);
