import { sendMail } from "../mail.js";

import {
    restoreAccountTemplate
} from "../templates/restoreAccount.template.js";


export const sendRestoreAccountEmail = async (
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
            "Your Tech Monster Account Has Been Restored",

        htmlContent:
            restoreAccountTemplate(
                studentName,
                student.email
            ),

    });
};
