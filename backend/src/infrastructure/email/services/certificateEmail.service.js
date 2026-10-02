import fs from "fs";

import { sendMail } from "../mail.js";

import {
    certificateTemplate
} from "../templates/certificate.template.js";


export const sendCertificateEmail = async (
    email,
    pdfPath,
    certificateDetails = {}
) => {

    try {

        const {
            studentName = "Student",
            programType = "course",
            programTitle = "Program",
            duration = "",
            completionDate = null,
            certificateNumber = "",
        } = certificateDetails;

        const normalizedProgramType =
            String(programType).toLowerCase() === "internship"
                ? "Internship"
                : "Course";

        const safeProgramTitle =
            String(programTitle || "Program")
                .trim()
                .replace(/[\/:*?"<>|]/g, "-")
                .replace(/\s+/g, " ");

        const attachmentFileName =
            safeProgramTitle + '-certificate.pdf';


        const formattedCompletionDate =
            completionDate
                ? new Date(completionDate).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                  })
                : "";

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
                    name: attachmentFileName,
                    content: fileContent,
                }
            ];
        }

        return await sendMail({

            to: email,

            subject:
                'Your ' + normalizedProgramType + ' Certificate is Ready - ' + safeProgramTitle,

            htmlContent:
                certificateTemplate({
                    studentName,
                    programType: normalizedProgramType,
                    programTitle: safeProgramTitle,
                    duration,
                    completionDate: formattedCompletionDate,
                    certificateNumber,
                }),

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
