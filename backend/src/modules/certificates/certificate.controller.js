import Certificate from "./models/Certificate.js";
import CertificatePayment from "../certificatePayments/models/CertificatePayment.js";
import fs from "fs";
import path from "path";
import StudentInternship from "../internships/models/StudentInternship.js";


import asyncHandler from "../../core/http/asyncHandler.js";
import AppError from "../../core/errors/AppError.js";

// =====================================
// GET MY CERTIFICATES
// =====================================
export const getMyCertificates =
    asyncHandler(async (req, res) => {

        const enrollments = await StudentInternship.find({
            student: req.user._id,
            status: "Completed",
        })
            .populate("course")
            .populate("internship")
            .sort({ completedAt: -1, createdAt: -1 });

        const certificates = await Promise.all(
            enrollments.map(async (enrollment) => {

                const isCourse = Boolean(enrollment.course);
                const program = enrollment.course || enrollment.internship;

                if (!program) return null;

                const programId = program._id;
                const programType = isCourse ? "course" : "internship";
                const certificateEligible = program.certificate !== false;

                const payment = await CertificatePayment.findOne({
                    student: req.user._id,
                    ...(isCourse
                        ? { course: programId, internship: null }
                        : { course: null, internship: programId }),
                }).sort({ createdAt: -1 });

                let certificate = null;

                if (payment?.status === "approved" && payment?.certificate) {
                    certificate = await Certificate.findOne({
                        _id: payment.certificate,
                        student: req.user._id,
                        ...(isCourse
                            ? { course: programId, internship: null }
                            : { course: null, internship: programId }),
                    });
                }

                return {
                    enrollmentId: enrollment._id,
                    programId,
                    programType,
                    programTitle: program.title,
                    certificateEligible,
                    completedAt: enrollment.completedAt,
                    fee: payment?.amount ?? (Number(program.price) || 0),
                    payment: payment
                        ? {
                            id: payment._id,
                            amount: payment.amount,
                            currency: payment.currency,
                            status: payment.status,
                            paidAt: payment.paidAt,
                        }
                        : null,
                    certificate: certificate
                        ? {
                            id: certificate._id,
                            studentName: certificate.studentName,
                            certificateNumber: certificate.certificateNumber,
                            issueDate: certificate.issueDate,
                        }
                        : null,
                    unlocked:
                        certificateEligible &&
                        payment?.status === "approved" &&
                        Boolean(certificate),
                };
            })
        );

        res.status(200).json({
            success: true,
            certificates: certificates.filter(Boolean),
        });
    });

// =====================================
// VERIFY CERTIFICATE
// =====================================
export const verifyCertificate = asyncHandler(async (req, res) => {
    const certificate = await Certificate.findOne({
        verificationToken: req.params.token,
    }).select(
        'studentName programTitle duration completionDate certificateNumber programType issueDate verificationToken'
    );

    if (!certificate) {
        throw new AppError(
            'Certificate verification failed. Certificate not found.',
            404
        );
    }

    return res.status(200).json({
        success: true,
        verified: true,
        certificate: {
            studentName: certificate.studentName,
            programTitle: certificate.programTitle,
            duration: certificate.duration,
            completionDate: certificate.completionDate,
            certificateNumber: certificate.certificateNumber,
            programType: certificate.programType,
            issueDate: certificate.issueDate,
        },
    });
});

// =====================================
// DOWNLOAD CERTIFICATE
// =====================================
export const downloadCertificate = asyncHandler(async (req, res) => {
    const certificate = await Certificate.findById(req.params.id);

    if (!certificate) {
        throw new AppError(
            "Certificate not found",
            404
        );
    }

    if (
        certificate.student.toString() !==
        req.user._id.toString()
    ) {
        throw new AppError(
            "Unauthorized access",
            403
        );
    }

    const payment = await CertificatePayment.findOne({
        student: req.user._id,
        certificate: certificate._id,
        status: "approved",
    });

    if (!payment) {
        throw new AppError(
            "Certificate is not available for download until payment is approved.",
            403
        );
    }

    certificate.downloadCount += 1;
    await certificate.save();

    const filePath = certificate.pdfUrl;

    if (!filePath || !fs.existsSync(filePath)) {
        throw new AppError(
            "Certificate PDF file not found.",
            404
        );
    }

    return res.download(
        filePath,
        path.basename(filePath)
    );
});