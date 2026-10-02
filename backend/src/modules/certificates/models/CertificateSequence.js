import mongoose from "mongoose";

const certificateSequenceSchema = new mongoose.Schema(
    {
        key: {
            type: String,
            required: true,
            unique: true,
            default: "certificate",
        },

        value: {
            type: Number,
            required: true,
            default: 0,
            min: 0,
            max: 9999,
        },

        releasedSerials: {
            type: [Number],
            default: [],
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model(
    "CertificateSequence",
    certificateSequenceSchema
);
