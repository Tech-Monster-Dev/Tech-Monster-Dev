export const allTasksCompletedTemplate = ({
    studentName,
    title,
    type,
    progress,
    formatDate,
}) => `
<div style="
    font-family:Arial,sans-serif;
    padding:30px;
    max-width:600px;
    margin:auto;
">

    <h2 style="color:#2563eb;">
        All Tasks Completed 🎉
    </h2>

    <p>
        Congratulations
        <b>${studentName}</b>!
    </p>

    <p style="color:#555;">
        All required tasks are complete.
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
            <b>Progress:</b>
            ${progress}%
        </p>

    </div>

    <p>
        <b>Tech Monster Pvt. Ltd.</b>
    </p>

</div>
`;