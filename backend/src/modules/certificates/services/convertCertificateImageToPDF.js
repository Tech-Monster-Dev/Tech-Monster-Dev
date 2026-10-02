import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";

export const convertCertificateImageToPDF = async (
    imageBuffer,
    outputPath
) => {
    if (!Buffer.isBuffer(imageBuffer) || imageBuffer.length === 0) {
        throw new Error("Certificate image is required.");
    }

    const outputDir = path.dirname(outputPath);

    await fs.promises.mkdir(outputDir, {
        recursive: true,
    });

    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({
            autoFirstPage: false,
            margin: 0,
        });

        const stream = fs.createWriteStream(outputPath);

        stream.on("finish", () => {
            resolve(outputPath);
        });

        stream.on("error", reject);

        doc.on("error", reject);

        doc.pipe(stream);

        const image = doc.openImage(imageBuffer);

        doc.addPage({
            size: [image.width, image.height],
            margin: 0,
        });

        doc.image(
            image,
            0,
            0,
            {
                width: image.width,
                height: image.height,
            }
        );

        doc.end();
    });
};
