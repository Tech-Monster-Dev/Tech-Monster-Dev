import User from "../../user/models/User.js";
import OTP from "../models/OTP.js";

import generateOTP from "./generateOTP.js";

import {
    sendOTPEmail
} from "../../../infrastructure/email/index.js";

import logActivity from "../../activity/logActivity.js";


export const signupUser = async ({
    req,
    username,
    email,
    password,
    terms
}) => {

    const existingUser = await User.findOne({ email });


    if (existingUser) {
        const error = new Error(
            "Email already exists"
        );

        error.statusCode = 409;

        throw error;
    }


    const otp = generateOTP();


    await OTP.deleteMany({
        email
    });


    await OTP.create({

        email,

        otp,

        expiresAt:
            new Date(
                Date.now() +
                10 * 60 * 1000
            )

    });


    sendOTPEmail(
        email,
        otp
    ).catch((error) => {

        console.error(
            "❌ Signup OTP sending failed:",
            error.message
        );

    });

    const user = await User.create({
        username,
        email,
        password,
        termsAccepted: terms

    });


    await logActivity(

        req,

        user._id,

        "SIGNUP",

        "Auth",

        "User account created"

    );


    return {
        user,
        email
    };

};
