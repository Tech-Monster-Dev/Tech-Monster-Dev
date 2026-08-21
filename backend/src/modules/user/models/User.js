import bcrypt from "bcrypt";
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        // ==========================
        // AUTH INFORMATION
        // ==========================

        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
            minlength: 3,
            maxlength: 30,
            index: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            index: true,
            lowercase: true,
            trim: true
        },

        password: {
            type: String,
            required: true,
            select: false,
            minlength: 8
        },

        role: {
            type: String,
            enum: ["student", "admin"],
            default: "student"
        },

        isVerified: {
            type: Boolean,
            default: false
        },

        termsAccepted: {
            type: Boolean,
            required: true,
            default: false
        },

        isBlocked: {
            type: Boolean,
            default: false
        },

        profileCompleted: {
            type: Boolean,
            default: false
        },

        // ==========================
        // PROFILE INFORMATION
        // ==========================

        firstName: {
            type: String,
            default: "",
            trim: true
        },

        middleName: {
            type: String,
            default: ""
        },
        lastName: {
            type: String,
            default: "",
            trim: true
        },

        avatar: {
            type: String,
            default: "/profile/default-profile.svg"
        },

        phone: {
            type: String,
            default: ""
        },

        bio: {
            type: String,
            default: "",
            maxlength: 500
        },

        gender: {
            type: String,
            enum: ["male", "female", "other", ""],
            default: ""
        },

        dateOfBirth: {
            type: Date,
            default: null
        },





        // ==========================
        // EDUCATION
        // ==========================
        education: {
            type: String,
            default: ""
        },


        college: {
            type: String,
            default: ""
        },

        branch: {
            type: String,
            default: ""
        },

        year: {
            type: String,
            default: ""
        },
        semester: {
            type: String,
            default: ""
        },

        // ==========================
        // SOCIAL LINKS
        // ==========================

        github: {
            type: String,
            default: ""
        },

        linkedin: {
            type: String,
            default: ""
        },

        // ==========================
        // PROFESSIONAL
        // ==========================

        skills: {
            type: [String],
            default: []
        },

        // ==========================
        // ACCOUNT
        // ==========================

        lastLogin: {
            type: Date,
            default: null
        },

        refreshToken: {
            type: String,
            default: "",
            select: false
        },

        currentAddress: {
            type: String,
            default: ""
        },

        localAddress: {
            type: String,
            default: ""
        },

        district: {
            type: String,
            default: ""
        },

        state: {
            type: String,
            default: ""
        },

        pincode: {
            type: String,
            default: ""
        },

    },
    {
        timestamps: true
    }
);

// =====================================
// HASH PASSWORD BEFORE SAVE
// =====================================

userSchema.pre("save", async function () {

    if (!this.isModified("password")) {
        return;
    }

    const salt = await bcrypt.genSalt(10);

    this.password = await bcrypt.hash(
        this.password,
        salt
    );

});

// =====================================
// COMPARE PASSWORD
// =====================================

userSchema.methods.comparePassword = async function (password) {

    return await bcrypt.compare(
        password,
        this.password
    );

};

export default mongoose.model("User", userSchema);