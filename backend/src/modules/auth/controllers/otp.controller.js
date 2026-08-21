import User from "../../user/models/User.js";

import {
    createOTP,
    sendOTPInBackground
} from "../services/otp.service.js";

import {
    verifyUserOTP
} from "../services/otpVerification.service.js";

import asyncHandler from "../../../core/http/asyncHandler.js";
import AppError from "../../../core/errors/AppError.js";


export const verifyOTP = asyncHandler(async (req, res) => {

    const { email, otp, purpose } = req.body;

    if (!email || !otp || !purpose) {
        throw new AppError(
            "Email, OTP and purpose are required",
            400
        );
    }

    const result = await verifyUserOTP({
        req,
        email,
        otp,
        purpose
    });

    if (result.passwordReset) {
        return res.status(200).json({
            success: true,
            message: "OTP verified successfully",
            email: result.email
        });
    }

    return res.status(200).json({
        success: true,
        message: "Email verified successfully",
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,

        user: {
            id: result.user._id,
            username: result.user.username,
            firstname: result.user.firstName,
            lastname: result.user.lastName,
            email: result.user.email,
            role: result.user.role,
            avatar: result.user.avatar
        }
    });

});


export const resendOTP = asyncHandler(async (req, res) => {

    const { email } = req.body;

    if (!email) {
        throw new AppError(
            "Email is required",
            400
        );
    }

    const user = await User.findOne({ email });

    if (!user) {
        throw new AppError(
            "User not found",
            404
        );
    }

    if (user.isVerified) {
        throw new AppError(
            "Email already verified",
            400
        );
    }

    const otp = await createOTP(email);

    sendOTPInBackground(
        email,
        otp,
        "Resend OTP sending failed"
    );

    return res.status(200).json({
        success: true,
        message: "OTP resent successfully"
    });

});
