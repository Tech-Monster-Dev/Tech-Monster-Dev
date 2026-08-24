export const taskCompletedTemplate = ({
    studentName,
    title,
    taskTitle,
    type,
}) => `
<div style="
    font-family:Arial,sans-serif;
    padding:30px;
    max-width:600px;
    margin:auto;
">

    <h2 style="color:#2563eb;">
        Task Completed 🎯
    </h2>

    <p>
        Nice work,
        <b>${studentName}</b>!
    </p>

    <p style="color:#555;">
        Your task has been submitted
        for review.
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
            <b>Task:</b>
            ${taskTitle || "N/A"}
        </p>

        <p>
            <b>Status:</b>
            Submitted
        </p>

    </div>

    <p>
        <b>Tech Monster Pvt. Ltd.</b>
    </p>

</div>
`;