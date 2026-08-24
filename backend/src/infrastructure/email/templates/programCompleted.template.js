export const programCompletedTemplate = ({
    studentName,
    title,
    type,
    certificateAvailable,
    formatDate,
}) => `
<div style="
    font-family:Arial,sans-serif;
    padding:30px;
    max-width:600px;
    margin:auto;
">

    <h2 style="color:#2563eb;">
        Congratulations! 🎉
    </h2>

    <p>
        Hi <b>${studentName}</b>,
    </p>

    <p style="color:#555;">
        You have completed your
        ${type}.
    </p>

    <div style="
        background:#f8fafc;
        padding:18px;
        border-radius:8px;
        margin:20px 0;
    ">

        <p>
            <b>
                ${type === "internship"
                    ? "Internship"
                    : "Course"}:
            </b>

            ${title || "N/A"}
        </p>

        <p>
            <b>Completion Date:</b>
            ${formatDate()}
        </p>

        <p>
            <b>Certificate:</b>
            ${
                certificateAvailable
                    ? "Available after issue"
                    : "Not available"
            }
        </p>

    </div>

    <p>
        <b>Tech Monster Pvt. Ltd.</b>
    </p>

</div>
`;