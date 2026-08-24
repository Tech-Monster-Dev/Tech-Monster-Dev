import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema(
    {
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        internship: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Internship",
            default: null,
        },

        course: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course",
            default: null,
        },

        courseSlug: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
        },

        moduleId: {
            type: String,
            required: true,
            trim: true,
        },

        moduleTitle: {
            type: String,
            default: "",
        },

        lessonId: {
            type: String,
            default: "",
            trim: true,
        },

        taskId: {
            type: String,
            required: true,
            trim: true,
        },

        taskTitle: {
            type: String,
            default: "",
        },

        problemStatement: {
            type: String,
            default: "",
        },

        // ==========================
        // STUDENT SUBMISSION
        // ==========================

        code: {
            type: String,
            default: "",
        },

        answer: {
            type: String,
            default: "",
        },

        githubLink: {
            type: String,
            default: "",
        },

        liveLink: {
            type: String,
            default: "",
        },

        submittedAt: {
            type: Date,
            default: null,
        },

        // ==========================
        // TASK STATUS
        // ==========================

        status: {
            type: String,
            enum: [
                "locked",
                "unlocked",
                "pending",
                "approved",
                "rejected",
                "expired",
            ],
            default: "locked",
        },

        // ==========================
        // DEADLINE
        // ==========================

        unlockedAt: {
            type: Date,
            default: null,
        },

        expiresAt: {
            type: Date,
            default: null,
        },

        expiredAt: {
            type: Date,
            default: null,
        },

        extendedAt: {
            type: Date,
            default: null,
        },

        extendedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },

        // ==========================
        // ADMIN REVIEW
        // ==========================

        reviewComment: {
            type: String,
            default: "",
        },

        reviewedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },

        reviewedAt: {
            type: Date,
            default: null,
        },

        emailFlags: {
            submittedEmailSent: {
                type: Boolean,
                default: false,
            },

            approvedEmailSent: {
                type: Boolean,
                default: false,
            },
        },
    },
    {
        timestamps: true,
    }
);

// One submission per student + course + module + lesson + task
submissionSchema.index(
    {
        student: 1,
        courseSlug: 1,
        moduleId: 1,
        lessonId: 1,
        taskId: 1,
    },
    {
        unique: true,
    }
);

export default mongoose.model(
    "Submission",
    submissionSchema
);