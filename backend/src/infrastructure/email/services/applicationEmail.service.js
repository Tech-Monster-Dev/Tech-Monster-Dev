import { sendMail } from "../mail.js";

import {
    applicationStatusTemplate
} from "../templates/applicationStatus.template.js";


export const sendApplicationStatusEmail = async (
    email,
    status
) => {

    try {

        return await sendMail({

            to: email,

            subject:
                "Application Status Updated - Tech Monster",

            htmlContent:
                applicationStatusTemplate(status),

        });

    } catch (error) {

        console.error(
            "❌ Application Status Email Error:",
            error.message
        );

        throw error;
    }
};