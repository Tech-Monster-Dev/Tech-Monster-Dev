import { sendMail } from "../mail.js";

import {
    resetPasswordTemplate
} from "../templates/resetPassword.template.js";


export const sendResetPasswordOTP = async (
    email,
    otp
) => {

    try {

        return await sendMail({

            to: email,

            subject:
                "Reset Your Password - Tech Monster",

            htmlContent:
                resetPasswordTemplate(otp),

        });

    } catch (error) {

        console.error(
            "❌ Reset Password Email Error:",
            error.message
        );

        throw error;
    }
};