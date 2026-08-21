import User from "../../user/models/User.js";
import RefreshToken from "../models/RefreshToken.js";

import generateToken from "./token/generateToken.js";
import generateRefreshToken from "./token/generateRefreshToken.js";

import {
    safeSendActivityEmail,
    sendWelcomeEmail
} from "../../../infrastructure/email/index.js";

import logActivity from "../../activity/logActivity.js";

import {
    findOTP,
    removeOTP
} from "./otp.service.js";


export const verifyUserOTP = async ({
    req,
    email,
    otp,
    purpose
}) => {

    const otpRecord =
        await findOTP(email);


    if (!otpRecord) {

        const error =
            new Error("Invalid OTP");

        error.statusCode = 400;

        throw error;

    }


    if (
        otpRecord.expiresAt <
        new Date()
    ) {

        await removeOTP(
            otpRecord._id
        );

        const error =
            new Error("OTP expired");

        error.statusCode = 400;

        throw error;

    }


    if (
        otpRecord.otp !== otp
    ) {

        const error =
            new Error("Invalid OTP");

        error.statusCode = 400;

        throw error;

    }


    if (purpose === "signup") {

        return verifySignupOTP(
            req,
            email,
            otpRecord
        );

    }


    if (
        purpose === "forgot-password"
    ) {

        await removeOTP(
            otpRecord._id
        );

        return {
            passwordReset: true,
            email
        };

    }


    const error =
        new Error(
            "Invalid OTP purpose"
        );

    error.statusCode = 400;

    throw error;

};


const verifySignupOTP = async (
    req,
    email,
    otpRecord
) => {

    const user =
        await User.findOne({
            email
        });


    if (!user) {

        const error =
            new Error("User not found");

        error.statusCode = 404;

        throw error;

    }


    user.isVerified = true;

    await user.save();


    await removeOTP(
        otpRecord._id
    );


    const accessToken =
        generateToken(user);

    const refreshToken =
        generateRefreshToken(user);


    await RefreshToken.create({

        user: user._id,

        token: refreshToken,

        expiresAt:
            new Date(
                Date.now() +
                7 * 24 * 60 * 60 * 1000
            )

    });


    safeSendActivityEmail(
        "welcome email",
        () => sendWelcomeEmail(user)
    );


    await logActivity(

        req,

        user._id,

        "VERIFY_EMAIL",

        "Auth",

        "Email verified successfully"

    );


    return {

        verified: true,

        accessToken,

        refreshToken,

        user

    };

};
