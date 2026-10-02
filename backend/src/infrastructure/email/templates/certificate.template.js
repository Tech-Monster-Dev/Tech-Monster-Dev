const escapeHtml = (value = "") =>
    String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

export const certificateTemplate = ({
    studentName = "Student",
    programType = "Course",
    programTitle = "Program",
    duration = "",
    completionDate = "",
    certificateNumber = "",
} = {}) => {
    const safeStudentName = escapeHtml(studentName);
    const safeProgramType = escapeHtml(programType);
    const safeProgramTitle = escapeHtml(programTitle);
    const safeDuration = escapeHtml(duration);
    const safeCompletionDate = escapeHtml(completionDate);
    const safeCertificateNumber = escapeHtml(certificateNumber);

    const detailRows = [
        '<tr><td style="padding:8px 0;color:#6b7280;width:42%;">Program Type</td><td style="padding:8px 0;font-weight:600;color:#111827;">' + safeProgramType + '</td></tr>',
        '<tr><td style="padding:8px 0;color:#6b7280;">Program</td><td style="padding:8px 0;font-weight:600;color:#111827;">' + safeProgramTitle + '</td></tr>',
        duration
            ? '<tr><td style="padding:8px 0;color:#6b7280;">Duration</td><td style="padding:8px 0;font-weight:600;color:#111827;">' + safeDuration + '</td></tr>'
            : "",
        completionDate
            ? '<tr><td style="padding:8px 0;color:#6b7280;">Completion Date</td><td style="padding:8px 0;font-weight:600;color:#111827;">' + safeCompletionDate + '</td></tr>'
            : "",
        certificateNumber
            ? '<tr><td style="padding:8px 0;color:#6b7280;">Certificate ID</td><td style="padding:8px 0;font-weight:600;color:#111827;">' + safeCertificateNumber + '</td></tr>'
            : "",
    ].join("");

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${safeProgramType} Certificate - Tech Monster</title>
</head>

<body style="margin:0;padding:0;background:#f4f7fb;font-family:Arial,Helvetica,sans-serif;color:#1f2937;">
    <div style="width:100%;padding:32px 16px;box-sizing:border-box;">
        <div style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:16px;overflow:hidden;">

            <div style="padding:28px 32px;background:#111827;color:#ffffff;">
                <div style="font-size:22px;font-weight:700;letter-spacing:.2px;">
                    Tech Monster
                </div>
                <div style="margin-top:6px;font-size:13px;color:#d1d5db;">
                    Certificate Notification
                </div>
            </div>

            <div style="padding:34px 32px;">
                <p style="margin:0 0 18px;font-size:16px;line-height:1.6;">
                    Dear <strong>${safeStudentName}</strong>,
                </p>

                <h1 style="margin:0 0 14px;font-size:26px;line-height:1.3;color:#111827;">
                    Congratulations on completing your ${safeProgramType}!
                </h1>

                <p style="margin:0 0 26px;font-size:15px;line-height:1.7;color:#4b5563;">
                    We are pleased to inform you that your certificate for
                    <strong>${safeProgramTitle}</strong> has been issued successfully.
                    Your official certificate PDF is attached to this email.
                </p>

                <div style="margin:0 0 26px;padding:20px;background:#f8fafc;border:1px solid #e5e7eb;border-radius:12px;">
                    <div style="font-size:13px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:.5px;margin-bottom:14px;">
                        Certificate Details
                    </div>

                    <table role="presentation" style="width:100%;border-collapse:collapse;font-size:14px;">
                        ${detailRows}
                    </table>
                </div>

                <p style="margin:0 0 8px;font-size:14px;line-height:1.6;color:#4b5563;">
                    Please keep this certificate safely for your future academic and professional records.
                </p>

                <p style="margin:24px 0 0;font-size:14px;line-height:1.6;color:#4b5563;">
                    Best wishes,
                </p>

                <p style="margin:4px 0 0;font-size:15px;font-weight:700;color:#111827;">
                    Tech Monster Team
                </p>
            </div>

            <div style="padding:20px 32px;background:#f8fafc;border-top:1px solid #e5e7eb;text-align:center;">
                <p style="margin:0;font-size:12px;line-height:1.6;color:#6b7280;">
                    This is an automated certificate notification from Tech Monster.
                    Please do not reply directly to this email.
                </p>
            </div>

        </div>
    </div>
</body>
</html>
`;
};
