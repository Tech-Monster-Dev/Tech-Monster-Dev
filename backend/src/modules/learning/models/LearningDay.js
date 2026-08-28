import mongoose from "mongoose";

const learningDaySchema = new mongoose.Schema(
    {
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
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

        courseSlug: {
            type: String,
            required: true,
            trim: true
        },

        date: {
            type: Date,
            required: true
        },

        lessonIds: {
            type: [String],
            default: []
        },

        taskIds: {
            type: [String],
            default: []
        },

        qualified: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

learningDaySchema.index(
    {
        student: 1,
        courseSlug: 1,
        date: 1
    },
    {
        unique: true
    }
);

export default mongoose.model(
    "LearningDay",
    learningDaySchema
);
