import fs from "fs";

import { sendMail } from "../mail.js";

import {
    certificateTemplate
} from "../templates/certificate.template.js";


export const sendCertificateEmail = async (
    email,
    pdfPath
) => {

    try {

        let attachment;


        if (
            pdfPath &&
            fs.existsSync(pdfPath)
        ) {

            const fileContent =
                fs.readFileSync(pdfPath)
                    .toString("base64");


            attachment = [
                {
                    name:
                        "Internship-Certificate.pdf",

                    content:
                        fileContent,
                }
            ];
        }


        return await sendMail({

            to: email,

            subject:
                "🎉 Internship Completion Certificate - Tech Monster",

            htmlContent:
                certificateTemplate(),

            attachment,

        });

    } catch (error) {

        console.error(
            "❌ Certificate Email Error:",
            error.message
        );

        throw error;
    }
};