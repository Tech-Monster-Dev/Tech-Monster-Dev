import { sendMail } from "../mail.js";

import {
    programCompletedTemplate
} from "../templates/programCompleted.template.js";


const formatDate = (date = new Date()) =>
    new Date(date).toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
        }
    );


const getStudentName = (student = {}) =>
    [
        student.firstName,
        student.lastName
    ]
    .filter(Boolean)
    .join(" ") ||
    student.username ||
    "Student";


export const sendProgramCompletedEmail = async ({
    student,
    title,
    type = "course",
    certificateAvailable = false,
}) => {

    return sendMail({

        to: student.email,

        subject:
            `${
                type === "internship"
                    ? "Internship"
                    : "Course"
            } Completed`,

        htmlContent:
            programCompletedTemplate({

                studentName:
                    getStudentName(student),

                title,

                type,

                certificateAvailable,

                formatDate,

            }),

    });
};