export const internshipJoinedTemplate = ({
    studentName,
    internship,
    enrollment,
    formatDate,
}) => `
<div style="
    font-family:Arial,sans-serif;
    padding:30px;
    max-width:600px;
    margin:auto;
">

    <h2 style="color:#2563eb;">
        Internship Enrollment Successful 🎉
    </h2>

    <p>
        Hi <b>${studentName}</b>,
    </p>

    <p style="color:#555;">
        You have successfully joined an internship.
    </p>

    <div style="
        background:#f8fafc;
        padding:18px;
        border-radius:8px;
        margin:20px 0;
    ">

        <p>
            <b>Internship:</b>
            ${internship.title || "N/A"}
        </p>

        <p>
            <b>Duration:</b>
            ${internship.duration || "N/A"}
        </p>

        <p>
            <b>Start Date:</b>
            ${formatDate(
                enrollment.startedAt ||
                enrollment.createdAt
            )}
        </p>

    </div>

    <p>
        <b>Tech Monster Pvt. Ltd.</b>
    </p>

</div>
`;