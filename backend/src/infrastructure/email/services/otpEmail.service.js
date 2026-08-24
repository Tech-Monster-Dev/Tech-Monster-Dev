import { sendMail } from "../mail.js";

import { otpTemplate } from "../templates/otp.template.js";


export const sendOTPEmail = async (
    email,
    otp
) => {

    try {

        console.log(
            `📧 Sending OTP email to ${email}`
        );


        const result = await sendMail({

            to: email,

            subject:
                "Verify Your Email - Tech Monster",

            htmlContent:
                otpTemplate(otp),

        });


        console.log(
            `✅ OTP email sent to ${email}`
        );


        return result;

    } catch (error) {

        console.error(
            "❌ OTP Email Error:",
            error.message
        );

        throw error;
    }
};