import CertificateSequence from "../models/CertificateSequence.js";

export const getNextCertificateNumber = async () => {
    const releasedSequence = await CertificateSequence.findOneAndUpdate(
        {
            key: "certificate",
            releasedSerials: {
                $exists: true,
                $ne: [],
            },
        },
        {
            $pop: {
                releasedSerials: -1,
            },
        },
        {
            new: false,
        }
    );

    if (releasedSequence?.releasedSerials?.length) {
        const serial =
            releasedSequence.releasedSerials[
                releasedSequence.releasedSerials.length - 1
            ];

        return String(serial).padStart(4, "0");
    }

    const sequence = await CertificateSequence.findOneAndUpdate(
        { key: "certificate" },
        {
            $inc: {
                value: 1,
            },
        },
        {
            new: true,
            upsert: true,
            setDefaultsOnInsert: true,
        }
    );

    if (sequence.value > 9999) {
        throw new Error(
            "Certificate serial number limit reached. Maximum supported serial is 9999."
        );
    }

    return String(sequence.value).padStart(4, "0");
};
