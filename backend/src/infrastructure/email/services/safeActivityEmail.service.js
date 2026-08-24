export const safeSendActivityEmail = (
    emailType,
    sendFunction
) => {

    Promise.resolve()
        .then(() => sendFunction())
        .catch((error) => {

            console.error(
                `❌ ${emailType} failed:`,
                error.message
            );

        });

};
