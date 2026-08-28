import { sendMail } from "../mail.js";

import {
    badgeEarnedTemplate
} from "../templates/badgeEarned.template.js";


const getStudentName = (student = {}) =>
    [
        student.firstName,
        student.lastName
    ]
    .filter(Boolean)
    .join(" ") ||
    student.username ||
    "Student";


const formatDate = (date = new Date()) =>
    new Date(date).toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );


export const sendBadgeEarnedEmail = async ({
    student,
    badge
}) => {

    return sendMail({

        to: student.email,

        subject:
            `Achievement Unlocked: ${badge.title}`,

        htmlContent:
            badgeEarnedTemplate({

                studentName:
                    getStudentName(student),

                badgeTitle:
                    badge.title,

                description:
                    badge.description,

                requirement:
                    badge.requirement,

                earnedAt:
                    formatDate(
                        badge.earnedAt
                    )

            })

    });
};
