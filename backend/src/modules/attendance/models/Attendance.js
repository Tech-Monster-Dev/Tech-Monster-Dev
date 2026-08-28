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

        checkIn: {

            type: Date

        },

        checkOut: {

            type: Date

        },

        workingHours: {
            type: Number,
            default: 0
        },

        workingMinutes: {

            type: Number,

            default: 0

        },

        status: {

            type: String,

            enum: [

                "Present",

                "Absent",

                "Leave"

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