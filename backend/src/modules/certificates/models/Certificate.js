import mongoose from "mongoose";

const certificateSchema = new mongoose.Schema(
    {
        // ==========================================
        // STUDENT
        // ==========================================

        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        // ==========================================
        // PROGRAM
        // Exactly one must be present.
        // ==========================================

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

        programType: {
            type: String,
            enum: ["internship", "course"],
            required: true,
        },

        // ==========================================
        // CERTIFICATE
        // ==========================================

        certificateNumber: {
            type: String,
            unique: true,
            required: true,
            index: true,
        },

        issueDate: {
            type: Date,
            default: Date.now,
        },

        pdfUrl: {
            type: String,
            default: "",
        },

        downloadCount: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);


// ==========================================
// PROGRAM VALIDATION
// Exactly one program is required.
// ==========================================

certificateSchema.pre(
    "validate",
    async function () {

        if (!this.internship && !this.course) {
            throw new Error(
                "Either internship or course is required."
            );
        }

        if (this.internship && this.course) {
            throw new Error(
                "Certificate cannot belong to both internship and course."
            );
        }

        if (
            this.programType === "internship" &&
            !this.internship
        ) {
            throw new Error(
                "Internship is required for internship certificate."
            );
        }

        if (
            this.programType === "course" &&
            !this.course
        ) {
            throw new Error(
                "Course is required for course certificate."
            );
        }

    }
);


// ==========================================
// STUDENT + PROGRAM INDEX
// ==========================================

certificateSchema.index({
    student: 1,
    internship: 1,
});

certificateSchema.index({
    student: 1,
    course: 1,
});


export default mongoose.model(
    "Certificate",
    certificateSchema
);
