export const accountDeletedTemplate = (
    studentName,
    contactEmail
) => {
    return `
        <div style="
            font-family: Arial, sans-serif;
            padding: 30px;
            max-width: 600px;
            margin: auto;
        ">

            <h1 style="
                color:#2563eb;
            ">
                Your Tech Monster Account Has Been Deleted
            </h1>

            <p>
                Hi <b>${studentName}</b>,
            </p>

            <p style="
                color:#555;
                line-height:1.7;
            ">
                Your Tech Monster account has been
                successfully deleted as requested.
            </p>

            <p style="
                color:#555;
                line-height:1.7;
            ">
                A backup of your account data has been
                securely generated and retained by Tech Monster.
            </p>

            <div style="
                margin-top:25px;
                padding:20px;
                background:#f3f4f6;
                border-radius:8px;
            ">

                <p style="
                    margin:0 0 10px;
                    font-weight:bold;
                ">
                    Need Your Full Account Backup Later?
                </p>

                <p style="
                    color:#555;
                    line-height:1.7;
                    margin:0;
                ">
                    If you need your complete Tech Monster
                    account backup in the future, please contact
                    Tech Monster through the Contact section
                    on our landing page.
                </p>

                <p style="
                    color:#555;
                    line-height:1.7;
                    margin-top:12px;
                ">
                    Contact email:
                    <b>${contactEmail}</b>
                </p>

            </div>

            <p style="
                color:#555;
                line-height:1.7;
                margin-top:25px;
            ">
                Thank you for being a part of Tech Monster.
            </p>

            <p style="
                margin-top:30px;
                font-weight:bold;
            ">
                Tech Monster Pvt. Ltd.
            </p>

        </div>
    `;
};
