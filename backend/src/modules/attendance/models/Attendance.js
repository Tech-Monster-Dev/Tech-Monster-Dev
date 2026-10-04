import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
    {
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        internship: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Internship",
            required: false
        },

        course: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course",
            required: false
        },

        status: {
            type: String,
            enum: [
                "Present",
                "Absent",
            ],
            default: "Present"
        }
    },

    {
        timestamps: true
    }
);

export default mongoose.model(
    "Attendance",
    attendanceSchema
);