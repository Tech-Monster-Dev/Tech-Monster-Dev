export const welcomeTemplate = (
    studentName
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
                Welcome to Tech Monster 🚀
            </h1>


            <p>
                Hi <b>${studentName}</b>,
            </p>


            <p style="
                color:#555;
                line-height:1.7;
            ">
                Your account has been created
                successfully.
            </p>


            <p style="
                color:#555;
                line-height:1.7;
            ">
                Verify your email and start
                learning from your dashboard.
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