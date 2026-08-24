import OTP from "../models/OTP.js";

import generateOTP from "./generateOTP.js";

import {
    sendOTPEmail
} from "../../../infrastructure/email/index.js";


export const createOTP = async (email) => {

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


    return otp;

};


export const sendOTPInBackground = (
    email,
    otp,
    message = "OTP sending failed"
) => {

    sendOTPEmail(
        email,
        otp
    ).catch((error) => {

        console.error(
            `❌ ${message}:`,
            error.message
        );

    });

};


export const findOTP = async (email) => {

    return OTP.findOne({
        email
    });

};


export const removeOTP = async (id) => {

    return OTP.deleteOne({
        _id: id
    });

};
