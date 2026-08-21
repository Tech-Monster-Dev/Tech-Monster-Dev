import User from "../../user/models/User.js";
import OTP from "../models/OTP.js";

import {
    sendResetPasswordOTP
} from "../../../infrastructure/email/index.js";

import generateOTP from "./generateOTP.js";


export const sendPasswordResetOTP = async (email) => {

    const user = await User.findOne({ email });

    if (!user) {
        const error = new Error("User not found");
        error.statusCode = 404;
        throw error;
    }

    const otp = generateOTP();

    await OTP.deleteMany({ email });

    await OTP.create({
        email,
        otp,
        expiresAt: new Date(
            Date.now() + 10 * 60 * 1000
        )
    });

    sendResetPasswordOTP(
        email,
        otp
    ).catch((error) => {

        console.error(
            "❌ Forgot password OTP sending failed:",
            error.message
        );

    });

};


export const verifyPasswordResetOTP = async ({
    email,
    otp
}) => {

    const otpRecord =
        await OTP.findOne({ email });

    if (!otpRecord) {
        const error = new Error("OTP not found");
        error.statusCode = 400;
        throw error;
    }

    if (otpRecord.expiresAt < new Date()) {

        await OTP.deleteOne({
            _id: otpRecord._id
        });

        const error = new Error("OTP expired");
        error.statusCode = 400;
        throw error;
    }

    if (otpRecord.otp !== otp) {
        const error = new Error("Invalid OTP");
        error.statusCode = 400;
        throw error;
    }

    await OTP.deleteOne({
        _id: otpRecord._id
    });

};


export const resetUserPassword = async ({
    email,
    newPassword,
    confirmPassword
}) => {

    if (newPassword !== confirmPassword) {
        const error =
            new Error("Passwords do not match");

        error.statusCode = 400;

        throw error;
    }

    const user =
        await User.findOne({ email });

    if (!user) {
        const error =
            new Error("User not found");

        error.statusCode = 404;

        throw error;
    }

    user.password = newPassword;

    await user.save();

    await OTP.deleteMany({ email });

};
