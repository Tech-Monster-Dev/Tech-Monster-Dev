export const resetPasswordTemplate = (otp) => {

    return `
        <div style="
            font-family: Arial, sans-serif;
            padding: 30px;
            max-width: 600px;
            margin: auto;
            border: 1px solid #e0e0e0;
            border-radius: 10px;
        ">

            <h2>
                Reset Your Password
            </h2>

            <p style="color:#555;">
                Your password reset OTP is:
            </p>


            <h1 style="
                color: #2563eb;
                letter-spacing: 8px;
                background: #eff6ff;
                padding: 15px 20px;
                display: inline-block;
                border-radius: 8px;
            ">
                ${otp}
            </h1>


            <p style="color:#555;">
                This OTP will expire in
                <b>10 minutes</b>.
            </p>


            <p style="
                color:#999;
                font-size:13px;
            ">
                If you did not request a password
                reset, please ignore this email.
            </p>


            <p style="
                color:#333;
                font-weight:bold;
                margin-top:25px;
            ">
                Tech Monster Pvt. Ltd.
            </p>

        </div>
    `;
};