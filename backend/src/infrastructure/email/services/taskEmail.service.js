import { sendMail } from "../mail.js";

import {
    taskCompletedTemplate
} from "../templates/taskCompleted.template.js";


const getStudentName = (student = {}) =>
    [
        student.firstName,
        student.lastName
    ]
    .filter(Boolean)
    .join(" ") ||
    student.username ||
    "Student";


export const sendTaskCompletedEmail = async ({
    student,
    title,
    taskTitle,
    type = "course",
}) => {

    return sendMail({

        to: student.email,

        subject:
            "Task Completed",

        htmlContent:
            taskCompletedTemplate({

                studentName:
                    getStudentName(student),

                title,

                taskTitle,

                type,

            }),

    });
};