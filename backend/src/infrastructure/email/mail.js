import dotenv from "dotenv";
dotenv.config();

const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";
const SENDER_EMAIL = process.env.EMAIL_USER || "techmonsterx6@gmail.com";
const SENDER_NAME = "Tech Monster";


export const sendMail = async ({
    to,
    subject,
    htmlContent,
    attachment,
}) => {

    if (!process.env.BREVO_API_KEY) {
        throw new Error(
            "BREVO_API_KEY environment variable is missing."
        );
    }


    const payload = {

        sender: {
            name: SENDER_NAME,
            email: SENDER_EMAIL,
        },

        to: [
            {
                email: to,
            },
        ],

        subject,

        htmlContent,
    };


    if (attachment) {
        payload.attachment = attachment;
    }


    const response = await fetch(
        BREVO_API_URL,
        {
            method: "POST",

            headers: {
                accept: "application/json",
                "api-key": process.env.BREVO_API_KEY,
                "content-type": "application/json",
            },

            body: JSON.stringify(payload),
        }
    );


    const data = await response.json();


    if (!response.ok) {
        throw new Error(
            data.message ||
            "Failed to send email"
        );
    }


    return data;
};