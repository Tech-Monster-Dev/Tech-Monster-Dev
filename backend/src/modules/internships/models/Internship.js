import mongoose from "mongoose";

const internshipSchema = new mongoose.Schema({

    title: {
        type: String,
        required: true,
        trim: true
    },

    slug: {
        type: String,
        unique: true,
        required: true
    },

    category: {
        type: String,
        required: true
    },

    level: {
        type: String,
        enum: [
            "Beginner",
            "Intermediate",
            "Advanced"
        ],
        default: "Beginner"
    },

    description: {
        type: String,
        required: true
    },

    thumbnail: {
        type: String,
        default: ""
    },

    duration: {
        type: String,
        required: true
    },

    price: {
        type: Number,
        required: true,
        min: 0
    },

    offer: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
        validate: {
            validator: Number.isInteger,
            message: "Offer must be a whole number"
        }
    },

    totalTasks: {
        type: Number,
        default: 0
    },

    totalNotes: {
        type: Number,
        default: 0
    },

    certificate: {
        type: Boolean,
        default: true
    },

    badge: {
        type: Boolean,
        default: true
    },

    isPublished: {
        type: Boolean,
        default: false
    }

}, {
    timestamps: true
});

export default mongoose.model(
    "Internship",
    internshipSchema
);