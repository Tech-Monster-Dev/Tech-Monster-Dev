import { sendMail } from "../mail.js";

import {
    courseJoinedTemplate
} from "../templates/courseJoined.template.js";


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


export const sendCourseJoinedEmail = async ({
    student,
    course,
    enrollment,
}) => {

    return sendMail({

        to: student.email,

        subject:
            "Course Enrollment Successful",

        htmlContent:
            courseJoinedTemplate({

                studentName:
                    getStudentName(student),

                course,

                enrollment,

                formatDate,

            }),

    });
};