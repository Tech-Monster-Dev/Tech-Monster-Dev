import { sendMail } from "../mail.js";

import {
    allTasksCompletedTemplate
} from "../templates/allTasksCompleted.template.js";


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


export const sendAllTasksCompletedEmail = async ({
    student,
    title,
    type = "course",
    progress = 100,
}) => {

    return sendMail({

        to: student.email,

        subject:
            "All Tasks Completed",

        htmlContent:
            allTasksCompletedTemplate({

                studentName:
                    getStudentName(student),

                title,

                type,

                progress,

                formatDate,

            }),

    });
};