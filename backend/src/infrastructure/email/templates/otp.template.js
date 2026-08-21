export const otpTemplate = (otp) => {

    return `
        <div style="
            font-family: Arial, sans-serif;
            padding: 30px;
            max-width: 600px;
            margin: auto;
            border: 1px solid #e0e0e0;
            border-radius: 10px;
            background: #ffffff;
        ">

            <h2 style="
                color: #111827;
            ">
                Verify Your Email
            </h2>


            <p style="
                color: #555;
                line-height: 1.6;
            ">
                Your Tech Monster verification
                code is:
            </p>


            <div style="
                margin: 25px 0;
                text-align: center;
            ">

                <span style="
                    display: inline-block;
                    padding: 15px 25px;
                    background: #eff6ff;
                    color: #2563eb;
                    font-size: 32px;
                    font-weight: bold;
                    letter-spacing: 8px;
                    border-radius: 8px;
                ">
                    ${otp}
                </span>

            </div>


            <p style="
                color: #555;
                line-height: 1.6;
            ">
                This OTP will expire in
                <b>10 minutes</b>.
            </p>


            <p style="
                color: #999;
                font-size: 13px;
            ">
                If you did not request this,
                please ignore this email.
            </p>


            <hr style="
                border: none;
                border-top: 1px solid #eee;
                margin: 25px 0;
            ">


            <p style="
                color: #333;
                font-weight: bold;
            ">
                Tech Monster Pvt. Ltd.
            </p>

        </div>
    `;
};