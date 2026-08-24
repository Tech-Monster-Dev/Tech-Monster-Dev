export const applicationStatusTemplate = (
    status
) => `
<div style="
    font-family:Arial,sans-serif;
    padding:30px;
    max-width:600px;
    margin:auto;
">

    <h2 style="color:#2563eb;">
        Application Status
    </h2>

    <p style="color:#555;">
        Your application status has
        been updated.
    </p>

    <div style="
        padding:15px;
        background:#eff6ff;
        border-radius:8px;
        margin:20px 0;
    ">

        <h3 style="
            color:#2563eb;
            margin:0;
        ">
            Status: ${status}
        </h3>

    </div>

    <p style="color:#555;">
        Thank you for using Tech Monster.
    </p>

    <p>
        <b>Tech Monster Pvt. Ltd.</b>
    </p>

</div>
`;