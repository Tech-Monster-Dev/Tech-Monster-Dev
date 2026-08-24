import { sendMail } from "../mail.js";

import {internshipJoinedTemplate} from "../templates/internshipJoined.template.js";


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


export const sendInternshipJoinedEmail = async ({
    student,
    internship,
    enrollment,
}) => {

    return sendMail({

        to: student.email,

        subject:
            "Internship Enrollment Successful",

        htmlContent:
            internshipJoinedTemplate({

                studentName:
                    getStudentName(student),

                internship,

                enrollment,

                formatDate,

            }),

    });
};