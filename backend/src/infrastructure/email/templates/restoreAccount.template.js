export const restoreAccountTemplate = (
    studentName,
    studentEmail
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
                Your Tech Monster Account Has Been Restored
            </h1>


            <p>
                Hi <b>${studentName}</b>,
            </p>


            <p style="
                color:#555;
                line-height:1.7;
            ">
                Your Tech Monster account has been
                successfully restored by the administrator.
            </p>


            <p style="
                color:#555;
                line-height:1.7;
            ">
                Your previously backed-up account data
                has also been restored.
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
                    Login Instructions
                </p>

                <p style="
                    color:#555;
                    line-height:1.7;
                    margin:0;
                ">
                    Login email:
                    <b>${studentEmail}</b>
                </p>

                <p style="
                    color:#555;
                    line-height:1.7;
                ">
                    Password:
                    Use the same password you used
                    before your account was deleted.
                </p>

            </div>


            <p style="
                color:#555;
                line-height:1.7;
                margin-top:25px;
            ">
                Please use your existing login credentials
                to access your account again.
            </p>


            <p style="
                color:#555;
                line-height:1.7;
            ">
                If you do not remember your previous password,
                use the Forgot Password option on the login page
                to reset it.
            </p>


            <p style="
                color:#555;
                line-height:1.7;
            ">
                For your security, never share your password
                with anyone.
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
