import { sendMail } from "../mail.js";

import {
    welcomeTemplate
} from "../templates/welcome.template.js";


export const sendWelcomeEmail = async (
    student
) => {

    const studentName =
        [
            student.firstName,
            student.lastName
        ]
        .filter(Boolean)
        .join(" ") ||
        student.username ||
        "Student";


    return sendMail({

        to: student.email,

        subject:
            "Welcome to Tech Monster",

        htmlContent:
            welcomeTemplate(studentName),

    });
};