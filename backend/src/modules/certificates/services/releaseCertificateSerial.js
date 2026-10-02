import CertificateSequence from "../models/CertificateSequence.js";

export const releaseCertificateSerial = async (certificateNumber) => {
    const serial = Number(String(certificateNumber || "").split("-").pop());

    if (!Number.isInteger(serial) || serial < 1 || serial > 9999) {
        return;
    }

    await CertificateSequence.findOneAndUpdate(
        { key: "certificate" },
        {
            $addToSet: {
                releasedSerials: serial,
            },
        },
        {
            upsert: true,
            setDefaultsOnInsert: true,
        }
    );
};
