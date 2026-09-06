import mongoose from "mongoose";

const chatBlockSchema = new mongoose.Schema(
    {
        blocker: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        blockedUser: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    },
    { timestamps: true }
);

chatBlockSchema.index(
    { blocker: 1, blockedUser: 1 },
    { unique: true }
);

export default mongoose.model("ChatBlock", chatBlockSchema);
