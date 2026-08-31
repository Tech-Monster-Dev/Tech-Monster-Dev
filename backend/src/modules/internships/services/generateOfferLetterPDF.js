import fs from "fs";
import path from "path";
import os from "os";
import PDFDocument from "pdfkit";
import { fileURLToPath } from "url";

const TEMPLATE_PATH = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "../assets/offer-letter-template.jpeg"
);

// Template is 1130x1392 pixels.
// Use 96 DPI so the PDF does not stretch the source image excessively.
const PAGE_WIDTH = 1130 * 72 / 96;
const PAGE_HEIGHT = 1392 * 72 / 96;

const COLORS = {
    navy: "#10255F",
    black: "#111111",
};

const getStudentName = (student = {}) =>
    [
        student.firstName,
        student.lastName,
    ]
        .filter(Boolean)
        .join(" ")
        .trim() ||
    student.username ||
    "Student";

const formatDate = (date = new Date()) =>
    new Date(date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    });

const formatShortDate = (date = new Date()) =>
    new Date(date).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });

const getInternshipMode = (internship = {}) =>
    internship.mode ||
    internship.internshipMode ||
    internship.workMode ||
    "Remote";

const getStipend = (internship = {}) => {
    if (
        internship.stipend === undefined ||
        internship.stipend === null ||
        internship.stipend === ""
    ) {
        return "Unpaid";
    }

    if (
        typeof internship.stipend === "string" &&
        internship.stipend.trim()
    ) {
        return internship.stipend;
    }

    if (Number(internship.stipend) === 0) {
        return "Unpaid";
    }

    return `₹${internship.stipend}`;
};

const getDuration = (internship = {}) =>
    internship.duration ||
    internship.durationText ||
    "N/A";

const getStartDate = (enrollment, internship) =>
    enrollment?.startedAt ||
    internship?.startDate ||
    internship?.startingDate ||
    new Date();

const getEndDate = (internship = {}, enrollment = {}) =>
    internship?.endDate ||
    internship?.endingDate ||
    internship?.completionDate ||
    enrollment?.completedAt ||
    null;

const fitText = ({
    doc,
    text,
    maxWidth,
    font = "Helvetica-Bold",
    size = 14,
    minSize = 8,
}) => {
    let currentSize = size;

    while (
        currentSize > minSize &&
        doc
            .font(font)
            .fontSize(currentSize)
            .widthOfString(String(text))
            > maxWidth
    ) {
        currentSize -= 0.5;
    }

    return currentSize;
};

const cover = (
    doc,
    x,
    y,
    width,
    height
) => {
    doc.save();
    doc
        .rect(x, y, width, height)
        .fill("#FFFFFF");
    doc.restore();
};

const writeText = ({
    doc,
    text,
    x,
    y,
    width,
    font = "Helvetica",
    size = 14,
    color = COLORS.black,
    align = "left",
}) => {
    doc
        .font(font)
        .fontSize(size)
        .fillColor(color)
        .text(String(text || ""), x, y, {
            width,
            lineBreak: false,
            align,
            margin: 0,
            paragraphGap: 0,
        });
};

export const generateOfferLetterPDF = async ({
    student,
    internship,
    enrollment,
}) => {
    if (!fs.existsSync(TEMPLATE_PATH)) {
        throw new Error(
            "Offer letter template image not found."
        );
    }

    const studentName = getStudentName(student);

    const internshipTitle =
        internship?.title ||
        "Internship";

    const mode =
        getInternshipMode(internship);

    const stipend =
        getStipend(internship);

    const duration =
        getDuration(internship);

    const startDate =
        getStartDate(
            enrollment,
            internship
        );

    const endDate =
        getEndDate(
            internship,
            enrollment
        );

    const offerDate =
        enrollment?.createdAt ||
        new Date();

    const outputPath = path.join(
        os.tmpdir(),
        `offer-letter-${student?._id || Date.now()}.pdf`
    );

    const doc = new PDFDocument({
        size: [
            PAGE_WIDTH,
            PAGE_HEIGHT,
        ],
        margin: 0,
        autoFirstPage: false,
    });

    const stream =
        fs.createWriteStream(
            outputPath
        );

    doc.pipe(stream);

    doc.addPage({
        size: [
            PAGE_WIDTH,
            PAGE_HEIGHT,
        ],
        margin: 0,
    });

    /*
     * =====================================================
     * ORIGINAL TEMPLATE
     * =====================================================
     */

    doc.image(
        TEMPLATE_PATH,
        0,
        0,
        {
            width: PAGE_WIDTH,
            height: PAGE_HEIGHT,
        }
    );

    /*
     * =====================================================
     * 01. OFFER DATE
     * =====================================================
     */

    cover(
        doc,
        900,
        248,
        150,
        35
    );

    writeText({
        doc,
        text: `Date: ${formatDate(offerDate)}`,
        x: 900,
        y: 262,
        width: 150,
        font: "Helvetica",
        size: 12,
        color: COLORS.black,
        align: "left",
    });

    /*
     * =====================================================
     * 02. STUDENT NAME
     * =====================================================
     */

    cover(
        doc,
        118,
        312,
        220,
        25
    );

    const studentNameSize = fitText({
        doc,
        text: studentName,
        maxWidth: 220,
        font: "Helvetica-Bold",
        size: 14,
        minSize: 10,
    });

    writeText({
        doc,
        text: studentName + ",",
        x: 124,
        y: 319,
        width: 220,
        font: "Helvetica-Bold",
        size: studentNameSize,
        color: COLORS.navy,
    });

    /*
     * =====================================================
     * 03. POSITION / INTERNSHIP TITLE
     * =====================================================
     */

    cover(
        doc,
        394,
        344,
        190,
        27
    );

    const titleSize = fitText({
        doc,
        text: internshipTitle,
        maxWidth: 190,
        font: "Helvetica-Bold",
        size: 14,
        minSize: 8,
    });

    writeText({
        doc,
        text: internshipTitle,
        x: 397,
        y: 351,
        width: 190,
        font: "Helvetica-Bold",
        size: titleSize,
        color: COLORS.navy,
    });

    /*
     * =====================================================
     * 04. DESIGNATION
     * =====================================================
     */

    cover(
        doc,
        174,
        448,
        160,
        25
    );

    const designationSize = fitText({
        doc,
        text: internshipTitle,
        maxWidth: 160,
        font: "Helvetica-Bold",
        size: 13,
        minSize: 8,
    });

    writeText({
        doc,
        text: internshipTitle,
        x: 176,
        y: 452,
        width: 160,
        font: "Helvetica-Bold",
        size: designationSize,
        color: COLORS.black,
    });

    /*
     * =====================================================
     * 05. INTERNSHIP MODE
     * =====================================================
     */

    cover(
        doc,
        444,
        440,
        125,
        34
    );

    const modeSize = fitText({
        doc,
        text: mode,
        maxWidth: 125,
        font: "Helvetica-Bold",
        size: 13,
        minSize: 9,
    });

    writeText({
        doc,
        text: mode,
        x: 448,
        y: 447,
        width: 125,
        font: "Helvetica-Bold",
        size: modeSize,
        color: COLORS.black,
    });

    /*
     * =====================================================
     * 06. DURATION
     * =====================================================
     */

    cover(
        doc,
        692,
        440,
        125,
        65
    );

    writeText({
        doc,
        text: startDate
            ? formatShortDate(startDate)
            : "N/A",
        x: 703,
        y: 442,
        width: 125,
        font: "Helvetica-Bold",
        size: 13,
        color: COLORS.black,
    });

    writeText({
        doc,
        text: "to",
        x: 744,
        y: 461,
        width: 40,
        font: "Helvetica",
        size: 12,
        color: COLORS.black,
        align: "center",
    });

    writeText({
        doc,
        text: endDate
            ? formatShortDate(endDate)
            : "N/A",
        x: 703,
        y: 476,
        width: 125,
        font: "Helvetica-Bold",
        size: 13,
        color: COLORS.black,
    });

    writeText({
        doc,
        text: `(${duration})`,
        x: 695,
        y: 493,
        width: 135,
        font: "Helvetica-Bold",
        size: 11,
        color: COLORS.black,
        align: "center",
    });

    /*
     * =====================================================
     * 07. STIPEND
     * =====================================================
     */

    cover(
        doc,
        938,
        445,
        100,
        28
    );

    const stipendSize = fitText({
        doc,
        text: stipend,
        maxWidth: 100,
        font: "Helvetica-Bold",
        size: 13,
        minSize: 9,
    });

    writeText({
        doc,
        text: stipend,
        x: 941,
        y: 452,
        width: 100,
        font: "Helvetica-Bold",
        size: stipendSize,
        color: COLORS.black,
    });

    /*
     * =====================================================
     * 08. MAIN INTERNSHIP DATES SENTENCE
     * =====================================================
     */

    cover(
        doc,
        80,
        520,
        850,
        48
    );

    const startText = startDate
        ? formatShortDate(startDate)
        : "N/A";

    const endText = endDate
        ? formatShortDate(endDate)
        : "N/A";

    const sentence =
        `Your internship will commence on ${startText} and will conclude on ${endText}. The internship is for a period of ${duration} and will be conducted ${mode.toLowerCase()}.`;

    doc
        .font("Helvetica")
        .fontSize(12)
        .fillColor(COLORS.black)
        .text(
            sentence,
            85,
            526,
            {
                width: 850,
                height: 42,
                lineGap: 1,
                lineBreak: true,
            }
        );

    /*
     * =====================================================
     * 09. ACCEPTANCE STUDENT NAME
     * =====================================================
     */

    cover(
        doc,
        95,
        1236,
        220,
        28
    );

    writeText({
        doc,
        text: studentName + ",",
        x: 98,
        y: 1242,
        width: 220,
        font: "Helvetica-Bold",
        size: 13,
        color: COLORS.navy,
    });

    /*
     * =====================================================
     * 10. ACCEPTANCE DATE
     * =====================================================
     */

    cover(
        doc,
        880,
        1288,
        110,
        28
    );

    writeText({
        doc,
        text: formatDate(offerDate),
        x: 875,
        y: 1290,
        width: 120,
        font: "Helvetica",
        size: 11,
        color: COLORS.black,
        align: "center",
    });

    /*
     * =====================================================
     * FINISH
     * =====================================================
     */

    doc.end();

    await new Promise(
        (resolve, reject) => {
            stream.on(
                "finish",
                resolve
            );

            stream.on(
                "error",
                reject
            );
        }
    );

    return {
        pdfPath: outputPath,
        studentName,
        internshipTitle,
        enrollmentId:
            enrollment?._id?.toString() || "",
    };
};
