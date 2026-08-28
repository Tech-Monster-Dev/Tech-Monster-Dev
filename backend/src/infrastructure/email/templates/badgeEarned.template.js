export const badgeEarnedTemplate = ({
    studentName,
    badgeTitle,
    description,
    requirement,
    earnedAt
}) => `
<div style="
    font-family:Arial,sans-serif;
    padding:30px;
    max-width:600px;
    margin:auto;
">

    <h2 style="color:#2563eb;">
        Achievement Badge Earned 🏆
    </h2>

    <p>
        Congratulations,
        <b>${studentName}</b>!
    </p>

    <p style="color:#555;">
        You have earned a new attendance achievement badge on Tech Monster.
    </p>

    <div style="
        background:#f8fafc;
        padding:20px;
        border-radius:10px;
        margin:20px 0;
    ">

        <h3 style="margin-top:0;">
            ${badgeTitle}
        </h3>

        <p>
            ${description || "Great work! Keep maintaining your attendance and activity."}
        </p>

        <p>
            <b>Requirement:</b>
            ${requirement || "Achievement completed"}
        </p>

        <p>
            <b>Earned:</b>
            ${earnedAt || "Today"}
        </p>

    </div>

    <p>
        Keep going and unlock your next achievement!
    </p>

    <p>
        <b>Tech Monster Pvt. Ltd.</b>
    </p>

</div>
`;
