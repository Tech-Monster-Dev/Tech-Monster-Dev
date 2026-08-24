import bcrypt from "bcrypt";
import OTP from "../auth/models/OTP.js";
import User from "./models/User.js";
import deleteAccountData from "./services/deleteAccount.service.js";


import asyncHandler from "../../core/http/asyncHandler.js";
import AppError from "../../core/errors/AppError.js";

export const getCurrentUser = asyncHandler(async (req, res) => {

    const user = req.user;

    if (!user) {

        throw new AppError(
            "User not found",
            404
        )
    }

    return res.status(200).json({
        success: true,
        message: "User fetched successfully",
        user: user,
    });

});


export const updateProfile = asyncHandler(async (req, res) => {

    const {
        firstName,
        lastName,
        phone,
        bio,
        college,
        skills,
        location,
        github,
        linkedin
    } = req.body;

    const user = await User.findByIdAndUpdate(

        req.user._id,

        {
            firstName,
            lastName,
            phone,
            bio,
            college,
            skills,
            location,
            github,
            linkedin
        },

        {
            new: true,
            runValidators: true
        }

    ).select("-password");

    return res.status(200).json({

        success: true,

        message: "Profile updated successfully",

        user

    });

    return res.status(500).json({

        success: false,

        message: "Internal Server Error"

    });
});


export const changePassword = asyncHandler(async (req, res) => {

    const {

        currentPassword,

        newPassword

    } = req.body;

    if (!currentPassword || !newPassword) {

        throw new AppError(
            "All fields are required",
            400
        )

    }

    const user = await User.findById(req.user._id);

    const isMatch = await bcrypt.compare(

        currentPassword,

        user.password

    );

    if (!isMatch) {

        throw new AppError(
            "Current password is incorrect",
            400
        )

    }

    user.password = newPassword;

    await user.save();

    return res.status(200).json({

        success: true,

        message: "Password changed successfully"

    });

    return res.status(500).json({

        success: false,

        message: "Internal Server Error"

    });

});


export const deleteAccount = asyncHandler(async (req, res) => {

    await deleteAccountData(req.user);

    return res.status(200).json({

        success: true,

        message: "Account and all related data deleted successfully"

    });

});