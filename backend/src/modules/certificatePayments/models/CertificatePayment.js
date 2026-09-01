import mongoose from "mongoose";

const certificatePaymentSchema = new mongoose.Schema(
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
        // A student can complete either a course
        // OR an internship, never both in one payment.
        // ==========================================

        course: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course",
            default: null,
        },

        internship: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Internship",
            default: null,
        },

        programType: {
            type: String,
            enum: ["course", "internship"],
            required: true,
        },

        programTitle: {
            type: String,
            required: true,
            trim: true,
        },

        // ==========================================
        // PAYMENT AMOUNT
        // Snapshot the admin-configured price at
        // payment creation time.
        // ==========================================

        amount: {
            type: Number,
            required: true,
            min: 0,
        },

        currency: {
            type: String,
            default: "INR",
            uppercase: true,
            trim: true,
        },

        // ==========================================
        // PAYMENT GATEWAY
        // ==========================================

        gateway: {
            type: String,
            enum: ["razorpay"],
            default: "razorpay",
        },

        gatewayOrderId: {
            type: String,
            default: "",
            trim: true,
        },

        gatewayPaymentId: {
            type: String,
            default: "",
            trim: true,
        },

        gatewaySignature: {
            type: String,
            default: "",
            trim: true,
        },

        transactionId: {
            type: String,
            default: "",
            trim: true,
        },

        // ==========================================
        // PAYMENT LIFECYCLE
        // ==========================================

        status: {
            type: String,
            enum: [
                "created",
                "pending",
                "paid",
                "payment_failed",
                "expired",
                "approval_pending",
                "approved",
                "rejected",
            ],
            default: "created",
            index: true,
        },

        paidAt: {
            type: Date,
            default: null,
        },

        expiresAt: {
            type: Date,
            default: null,
        },

        // ==========================================
        // ADMIN REVIEW
        // ==========================================

        reviewedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },

        reviewedAt: {
            type: Date,
            default: null,
        },

        rejectionReason: {
            type: String,
            default: "",
            trim: true,
        },

        // ==========================================
        // QR / CHECKOUT
        // ==========================================

        qrCodeId: {
            type: String,
            default: "",
            trim: true,
        },

        qrCodeData: {
            type: String,
            default: "",
        },

        // ==========================================
        // CERTIFICATE
        // Populated only after admin approval.
        // ==========================================

        certificate: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Certificate",
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

// ==========================================
// PRE-VALIDATION
// A payment belongs to exactly one program.
// ==========================================

certificatePaymentSchema.pre(
    "validate",
    function (next) {
        if (!this.course && !this.internship) {
            return next(
                new Error(
                    "Either course or internship is required"
                )
            );
        }

        if (this.course && this.internship) {
            return next(
                new Error(
                    "A payment cannot belong to both course and internship"
                )
            );
        }

        if (
            this.programType === "course" &&
            !this.course
        ) {
            return next(
                new Error(
                    "Course is required for course payment"
                )
            );
        }

        if (
            this.programType === "internship" &&
            !this.internship
        ) {
            return next(
                new Error(
                    "Internship is required for internship payment"
                )
            );
        }

        next();
    }
);

// ==========================================
// ONE ACTIVE PAYMENT PER STUDENT + PROGRAM
// ==========================================

certificatePaymentSchema.index(
    {
        student: 1,
        course: 1,
        internship: 1,
        status: 1,
    }
);

// ==========================================
// GATEWAY IDs MUST BE UNIQUE WHEN PRESENT
// ==========================================

certificatePaymentSchema.index(
    {
        qrCodeId: 1,
    },
    {
        unique: true,
        sparse: true,
    }
);

certificatePaymentSchema.index(
    {
        gatewayOrderId: 1,
    },
    {
        unique: true,
        sparse: true,
    }
);

certificatePaymentSchema.index(
    {
        gatewayPaymentId: 1,
    },
    {
        unique: true,
        sparse: true,
    }
);

certificatePaymentSchema.index(
    {
        transactionId: 1,
    },
    {
        unique: true,
        sparse: true,
    }
);

export default mongoose.model(
    "CertificatePayment",
    certificatePaymentSchema
);
