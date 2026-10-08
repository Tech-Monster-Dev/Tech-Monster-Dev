import mongoose from "mongoose";

const deletedStudentBackupSchema = new mongoose.Schema(
    {
        originalUserId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            unique: true,
            index: true,
        },

        studentName: {
            type: String,
            required: true,
            trim: true,
        },

        studentEmail: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
        },

        backupFolder: {
            type: String,
            required: true,
            trim: true,
        },

        pdfPath: {
            type: String,
            required: true,
            trim: true,
        },

        snapshot: {
            type: mongoose.Schema.Types.Mixed,
            required: true,
        },

        deletedAt: {
            type: Date,
            default: Date.now,
        },

        deletedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model(
    "DeletedStudentBackup",
    deletedStudentBackupSchema
);