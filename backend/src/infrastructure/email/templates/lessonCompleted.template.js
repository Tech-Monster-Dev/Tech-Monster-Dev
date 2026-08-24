export const lessonCompletedTemplate = ({
    studentName,
    title,
    lessonName,
    progress,
    type,
}) => `
<div style="
    font-family:Arial,sans-serif;
    padding:30px;
    max-width:600px;
    margin:auto;
">

    <h2 style="color:#2563eb;">
        Lesson Completed 🎯
    </h2>

    <p>
        Great work
        <b>${studentName}</b>!
    </p>

    <p style="color:#555;">
        You have successfully completed
        a lesson in your ${type}.
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
            <b>Lesson:</b>
            ${lessonName || "N/A"}
        </p>

        <p>
            <b>Progress:</b>
            ${progress ?? 0}%
        </p>

    </div>

    <p>
        Keep learning and keep building 🚀
    </p>

    <p>
        <b>Tech Monster Pvt. Ltd.</b>
    </p>

</div>
`;



export const allLessonsCompletedTemplate = ({
    studentName,
    title,
    type,
    formatDate,
}) => `
<div style="
    font-family:Arial,sans-serif;
    padding:30px;
    max-width:600px;
    margin:auto;
">

    <h2 style="color:#2563eb;">
        All Lessons Completed 🎉
    </h2>

    <p>
        Congratulations
        <b>${studentName}</b>!
    </p>

    <p style="color:#555;">
        You have completed all lessons.
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
            100%
        </p>

    </div>

    <p>
        Keep going 🚀
    </p>

    <p>
        <b>Tech Monster Pvt. Ltd.</b>
    </p>

</div>
`;
