import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

export const generateCertificatePDF = async (
    certificate,
    student,
    program
) => {

    return new Promise((resolve, reject) => {

        const uploadDir = path.join(
            process.cwd(),

            "uploads",
            "certificates"
        );

        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, {
                recursive: true
            });
        }

        const filePath = path.join(
            uploadDir,
            `Certificate-${student._id}-${certificate._id}.pdf`
        );

        const doc = new PDFDocument({
            size: "A4",
            margin: 50
        });

        const stream =
            fs.createWriteStream(filePath);

        doc.pipe(stream);

        const programTitle =
            program?.title ||
            "Program";

        const programType =
            certificate?.programType === "course"
                ? "course"
                : "internship";

        const completionText =
            programType === "course"
                ? `has successfully completed the course in ${programTitle}.`
                : `has successfully completed the internship as ${programTitle}.`;

        const studentName =
            `${student?.firstName || ""} ${student?.lastName || ""}`
                .trim() ||
            "Student";

        doc
            .fontSize(28)
            .text(
                "TECH MONSTER PVT. LTD.",
                {
                    align: "center"
                }
            );

        doc.moveDown();

        doc
            .fontSize(24)
            .text(
                "CERTIFICATE OF COMPLETION",
                {
                    align: "center"
                }
            );

        doc.moveDown(2);

        doc
            .fontSize(14)
            .text(
                "This is to certify that",
                {
                    align: "center"
                }
            );

        doc.moveDown();

        doc
            .fontSize(22)
            .text(
                studentName,
                {
                    align: "center"
                }
            );

        doc.moveDown();

        doc
            .fontSize(14)
            .text(
                completionText,
                {
                    align: "center"
                }
            );

        doc.moveDown(2);

        doc.text(
            `Certificate No : ${certificate.certificateNumber}`
        );

        doc.text(
            `Issue Date : ${new Date(
                certificate.issueDate
            ).toDateString()}`
        );

        doc.moveDown(3);

        doc.text(
            "HR Manager",
            {
                align: "left"
            }
        );

        doc.text(
            "Tech Monster Pvt. Ltd."
        );

        doc.end();

        stream.on(
            "finish",
            () => resolve(filePath)
        );

        stream.on(
            "error",
            reject
        );
    });
};
