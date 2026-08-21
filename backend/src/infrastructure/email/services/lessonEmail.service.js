import { sendMail } from "../mail.js";

import {
    lessonCompletedTemplate
} from "../templates/lessonCompleted.template.js";

import {
    allLessonsCompletedTemplate
} from "../templates/lessonCompleted.template.js";


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



/* ==========================================
   LESSON COMPLETED
========================================== */

export const sendLessonCompletedEmail = async ({
    student,
    title,
    lessonName,
    progress,
    type = "course",
}) => {

    return sendMail({

        to: student.email,

        subject:
            "Lesson Completed",

        htmlContent:
            lessonCompletedTemplate({

                studentName:
                    getStudentName(student),

                title,

                lessonName,

                progress,

                type,

            }),

    });
};



/* ==========================================
   ALL LESSONS COMPLETED
========================================== */

export const sendAllLessonsCompletedEmail = async ({
    student,
    title,
    type = "course",
}) => {

    return sendMail({

        to: student.email,

        subject:
            "All Lessons Completed",

        htmlContent:
            allLessonsCompletedTemplate({

                studentName:
                    getStudentName(student),

                title,

                type,

                formatDate,

            }),

    });
};
