import mongoose from "mongoose";

const activityLogSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        action: {
            type: String,
            required: true
        },
        module: {
            type: String,
            enum: [
                "Auth",
                "Profile",
                "Internship",
                "Course",
                "Certificate",
                "Notification",
                "Task",
                "Message",
                "Admin"
            ],
            required: true
        },
        description: {
            type: String,
            required: true
        },
        ipAddress: {
            type: String,
            default: ""
        },
        userAgent: {
            type: String,
            default: ""
        },
        target: {
            type: mongoose.Schema.Types.ObjectId,
            refPath: "targetModel"
        },
        targetModel: {
            type: String,
            enum: [
                "User",
                "Internship",
                "Task",
                "Attendance",
                "Certificate"
            ],
            default: null
        }
    },

    {
        timestamps: true
    }
);

export default mongoose.model(
    "ActivityLog",
    activityLogSchema
);