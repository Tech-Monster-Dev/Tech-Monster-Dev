import mongoose from "mongoose";

const badgeSchema = new mongoose.Schema({

    title: {
        type: String,
        required: true
    },

    icon: {
        type: String,
        default: ""
    },

    description: {
        type: String
    },

    color: {
        type: String,
        default: "#FFD700"
    },

    requirement: {
        type: String
    },

    category: {
        type: String,
        enum: [
            "COURSE",
            "TASK",
            "ATTENDANCE"
        ],
        default: "COURSE"
    }

}, {
    timestamps: true
});

export default mongoose.model(
    "Badge",
    badgeSchema
);