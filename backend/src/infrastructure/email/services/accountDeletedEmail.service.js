import { sendMail } from "../mail.js";

import {
    accountDeletedTemplate
} from "../templates/accountDeleted.template.js";

export const sendAccountDeletedEmail = async (
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
            "Your Tech Monster Account Has Been Deleted",
        htmlContent:
            accountDeletedTemplate(
                studentName,
                "techmonsterx6@gmail.com"
            ),
    });
};
