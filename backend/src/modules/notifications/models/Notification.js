import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(

    {

        user: {

            type: mongoose.Schema.Types.ObjectId,

            ref: "User",

            required: true

        },

        title: {

            type: String,

            required: true

        },

        message: {

            type: String,

            required: true

        },

        type: {
            type: String,
            enum: [
                "application",
                "interview",
                "offer",
                "certificate",
                "message",
                "company",
                "follow",
                "system"
            ],
            default: "system"
        },

        context: {
            type: mongoose.Schema.Types.Mixed,
            default: null
        },

        isRead: {

            type: Boolean,

            default: false

        }

    },

    {

        timestamps: true

    }

);

export default mongoose.model(

    "Notification",

    notificationSchema

);