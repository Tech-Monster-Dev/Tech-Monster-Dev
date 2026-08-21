import asyncHandler from "../../../core/http/asyncHandler.js";
import AppError from "../../../core/errors/AppError.js";

import {
    sendPasswordResetOTP,
    verifyPasswordResetOTP,
    resetUserPassword
} from "../services/password.service.js";


// ==========================================
// FORGOT PASSWORD
// ==========================================

export const forgotPassword = asyncHandler(
    async (req, res) => {

        const { email } = req.body;

        if (!email) {
            throw new AppError(
                "Email is required",
                400
            );
        }

        await sendPasswordResetOTP(email);

        return res.status(200).json({
            success: true,
            message: "Password reset OTP sent"
        });

    }
);


// ==========================================
// VERIFY RESET OTP
// ==========================================

export const verifyResetOTP = asyncHandler(
    async (req, res) => {

        const {
            email,
            otp
        } = req.body;

        if (!email || !otp) {
            throw new AppError(
                "Email and OTP are required",
                400
            );
        }

        await verifyPasswordResetOTP({
            email,
            otp
        });

        return res.status(200).json({
            success: true,
            message: "OTP verified successfully"
        });

    }
);


// ==========================================
// RESET PASSWORD
// ==========================================

export const resetPassword = asyncHandler(
    async (req, res) => {

        const {
            email,
            newPassword,
            confirmPassword
        } = req.body;

        if (
            !email ||
            !newPassword ||
            !confirmPassword
        ) {
            throw new AppError(
                "All fields are required",
                400
            );
        }

        await resetUserPassword({
            email,
            newPassword,
            confirmPassword
        });

        return res.status(200).json({
            success: true,
            message: "Password reset successfully"
        });

    }
);
