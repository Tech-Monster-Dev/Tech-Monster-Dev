import StudentInternship from "../../internships/models/StudentInternship.js";
import CertificatePayment from "../models/CertificatePayment.js";
import Certificate from "../../certificates/models/Certificate.js";
import { convertCertificateImageToPDF } from "../../certificates/services/convertCertificateImageToPDF.js";
import { releaseCertificateSerial } from "../../certificates/services/releaseCertificateSerial.js";
import fs from "fs";
import path from "path";
import Course from "../../courses/models/Course.js";
import Internship from "../../internships/models/Internship.js";
import Notification from "../../notifications/models/Notification.js";

import { sendCertificateEmail } from "../../../infrastructure/email/index.js";

import AppError from "../../../core/errors/AppError.js";

const getStudentFullName = (student = {}) => {
    const name = [student.firstName, student.middleName, student.lastName]
        .map((value) => String(value || '').trim())
        .filter(Boolean)
        .join(' ');

    return name || String(student.username || '').trim() || 'Student';
};

const sanitizeFileName = (value, fallback) =>
    String(value || '')
        .replace(/[<>:"/\\|?*]/g, '_')
        .trim() || fallback;

/*
 * ==========================================
 * GET PENDING CERTIFICATE PAYMENTS
 * ==========================================
*/

export const getPendingCertificatePayments = async () => {
    return CertificatePayment.find({
        status: "approval_pending",
    })
        .populate(
            "student",
            "firstName lastName username email avatar"
        )
        .populate(
            "course",
            "title slug category duration"
        )
        .populate(
            "internship",
            "title slug category duration"
        )
        .sort({
            paidAt: -1,
            createdAt: -1,
        });
};

/*
 * ==========================================
 * APPROVE CERTIFICATE PAYMENT
 * ==========================================
 *
 * Payment must already be verified.
 *
 * Only admin approval can move the payment
 * from approval_pending -> approved.
 *
 * Certificate creation happens here.
*/

export const approveCertificatePayment = async (paymentId, reviewerId, certificateImageBuffer) => {
    const payment = await CertificatePayment.findById(
        paymentId
    );

    if (!payment) {
        throw new AppError(
            "Certificate payment not found.",
            404
        );
    }

    if (
        payment.status !==
        "approval_pending"
    ) {
        throw new AppError(
            `Payment cannot be approved from "${payment.status}" status.`,
            400
        );
    }

    const program = payment.programType === "course"
        ? await Course.findById(
            payment.course
        )
        : await Internship.findById(
            payment.internship
        );

    if (!program) {
        throw new AppError(
            "Certificate program not found.",
            404
        );
    }

    if (
        program.certificate === false
    ) {
        throw new AppError(
            "Certificate is disabled for this program.",
            400
        );
    }

    if (!Buffer.isBuffer(certificateImageBuffer) || certificateImageBuffer.length === 0) {
        throw new AppError(
            "Certificate image is required for approval.",
            400
        );
    }

    /*
     * ==========================================
     * FIND STUDENT ENROLLMENT
     * ==========================================
    */
    const studentInternship = await StudentInternship.findOne({
        student: payment.student,
        ...(payment.programType === "course"
            ? { course: payment.course }
            : { internship: payment.internship }),
    }).populate("student");

    if (!studentInternship?.student) {
        throw new AppError(
            "Student enrollment record not found.",
            404
        );
    }

    if (studentInternship.status !== "Completed") {
        throw new AppError(
            "Student has not completed the program.",
            400
        );
    }

    if (!studentInternship.completedAt) {
        throw new AppError(
            "Program completion date is missing.",
            400
        );
    }

    const studentName = getStudentFullName(studentInternship.student);
    const programTitle = String(program.title || payment.programTitle || "Program").trim();
    const duration = String(program.duration || "").trim();

    if (!duration) {
        throw new AppError(
            "Program duration is missing.",
            400
        );
    }

    /*
     * ==========================================
     * PREVENT DUPLICATE CERTIFICATE
     * ==========================================
    */
    const certificateQuery = payment.programType === "course"
        ? {
            student: payment.student,
            course: payment.course,
        }
        : {
            student: payment.student,
            internship: payment.internship,
        };

    const existingCertificate = await Certificate.findOne(
        certificateQuery
    );

    if (existingCertificate) {
        payment.certificateNumber = existingCertificate.certificateNumber;
        payment.status = "approved";
        payment.reviewedBy = reviewerId;
        payment.reviewedAt = new Date();
        payment.certificate = existingCertificate._id;
        await payment.save();

        return {
            payment,
            certificate: existingCertificate,
        };
    }

    /*
     * ==========================================
     * CERTIFICATE ID + VERIFICATION TOKEN
     * ==========================================
    */
    const verificationToken = String(
        payment.verificationToken || ""
    ).trim();

    if (verificationToken === "") {
        throw new AppError(
            "Verification token is missing from the payment request.",
            400
        );
    }

    /*
     * ==========================================
     * CERTIFICATE PDF PATH
     * ==========================================
    */
    const studentFolder = sanitizeFileName(
        studentName,
        "Student"
    );
    const programFileName = sanitizeFileName(programTitle, "Program") + ".pdf";
    const uploadDir = path.join(
        process.cwd(),
        "uploads",
        "certificates",
        studentFolder
    );
    const pdfPath = path.join(
        uploadDir,
        programFileName
    );
    const tempPdfPath = path.join(
        uploadDir,
        "." + Date.now() + "-" + programFileName
    );

    await convertCertificateImageToPDF(
        certificateImageBuffer,
        tempPdfPath
    );

    const certificateNumber = String(
        payment.certificateNumber || ""
    ).trim();

    if (!certificateNumber) {
        throw new AppError(
            "Certificate ID is missing from the payment request.",
            400
        );
    }

    await fs.promises.rename(tempPdfPath, pdfPath);

    /*
     * ==========================================
     * CREATE CERTIFICATE
     * ==========================================
    */
    let certificate;

    try {
        certificate = await Certificate.create({
            student: payment.student,
            internship: payment.programType === "internship" ? payment.internship : null,
            course: payment.programType === "course" ? payment.course : null,
            programType: payment.programType,
            certificateNumber,
            studentName,
            programTitle,
            duration,
            completionDate: studentInternship.completedAt,
            verificationToken,
            pdfUrl: pdfPath,
        });
    } catch (error) {
        await fs.promises.rm(pdfPath, { force: true });
        throw error;
    }

    /*
     * ==========================================
     * UPDATE PAYMENT
     * ==========================================
    */
    payment.status = "approved";
    payment.reviewedBy = reviewerId;
    payment.reviewedAt = new Date();
    payment.certificate = certificate._id;

    await payment.save();

    /*
     * ==========================================
     * UPDATE STUDENT CERTIFICATE FLAG
     * ==========================================
    */
    studentInternship.certificateIssued = true;
    studentInternship.emailFlags = studentInternship.emailFlags || {};

    await studentInternship.save();

    /*
     * ==========================================
     * SEND CERTIFICATE EMAIL
     * ==========================================
    */
    await sendCertificateEmail(
        studentInternship.student.email,
        pdfPath,
        {
            studentName,
            programType: payment.programType,
            programTitle,
            duration,
            completionDate: studentInternship.completedAt,
            certificateNumber,
        }
    );

    studentInternship.emailFlags.certificateEmailSent = true;
    await studentInternship.save();

    /*
     * ==========================================
     * NOTIFICATION
     * ==========================================
    */
    await Notification.create({
        user: payment.student,
        title: "Certificate Approved",
        message: `Your ${payment.programTitle} certificate has been approved and is ready.`,
        type: "certificate",
        context: {
            paymentId: payment._id,
            programId: payment.programType === "course" ? payment.course : payment.internship,
            programType: payment.programType,
            certificateId: certificate?._id || payment.certificate || null
        },
    });

    return {
        payment,
        certificate,
    };
};

/*
 * ==========================================
 * REJECT CERTIFICATE PAYMENT
 * ==========================================
*/
export const rejectCertificatePayment = async (paymentId, reviewerId, rejectionReason) => {
    const payment = await CertificatePayment.findById(
        paymentId
    );

    if (!payment) {
        throw new AppError(
            "Certificate payment not found.",
            404
        );
    }

    if (
        payment.status !==
        "approval_pending"
    ) {
        throw new AppError(
            `Payment cannot be rejected from "${payment.status}" status.`,
            400
        );
    }

    const reason = String(
        rejectionReason || ""
    ).trim();

    if (!reason) {
        throw new AppError(
            "Rejection reason is required.",
            400
        );
    }

    payment.status = "rejected";
    payment.reviewedBy = reviewerId;
    payment.reviewedAt = new Date();
    payment.rejectionReason = reason;

    await releaseCertificateSerial(
        payment.certificateNumber
    );

    await payment.save();

    await Notification.create({
        user: payment.student,
        title: "Certificate Payment Rejected",
        message: `Your certificate payment for ${payment.programTitle} was rejected. Reason: ${reason}`,
        type: "certificate",
        context: {
            paymentId: payment._id,
            programId: payment.programType === "course" ? payment.course : payment.internship,
            programType: payment.programType,
            certificateId: payment.certificate || null
        },
    });

    return payment;
};