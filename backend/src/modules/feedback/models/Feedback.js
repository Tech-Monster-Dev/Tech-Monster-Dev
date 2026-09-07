import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema(
    {
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        type: {
            type: String,
            enum: ["website", "course", "internship", "bug"],
            required: true
        },

        subject: {
            type: String,
            required: true,
            trim: true,
            maxlength: 150
        },

        message: {
            type: String,
            required: true,
            trim: true,
            maxlength: 3000
        },

        rating: {
            type: Number,
            required: false,
            min: 1,
            max: 5
        },

        course: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course",
            default: null
        },

        internship: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Internship",
            default: null
        },

        isPublic: {
            type: Boolean,
            default: false
        },

        moderationStatus: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending"
        },

        moderationReason: {
            type: String,
            default: ""
        }
    },
    {
        timestamps: true
    }
);

feedbackSchema.index({
    type: 1,
    createdAt: -1
});

feedbackSchema.index({
    type: 1,
    rating: -1,
    isPublic: 1,
    moderationStatus: 1,
    createdAt: -1
});

export default mongoose.model("Feedback", feedbackSchema);
