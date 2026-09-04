import Certificate from "./models/Certificate.js";
import CertificatePayment from "../certificatePayments/models/CertificatePayment.js";
import fs from "fs";
import path from "path";
import StudentInternship from "../internships/models/StudentInternship.js";
import Notification from "../notifications/models/Notification.js";

import { generateCertificatePDF } from "./services/generateCertificatePDF.js";

import { sendCertificateEmail } from "../../infrastructure/email/index.js";

import logActivity from "../activity/logActivity.js";

import asyncHandler from "../../core/http/asyncHandler.js";
import AppError from "../../core/errors/AppError.js";




// =====================================
// ISSUE CERTIFICATE
// =====================================

export const issueCertificate = asyncHandler(async (req, res) => {


    const { internshipId } = req.body;



    if (!internshipId) {

        throw new AppError(
            "Internship ID is required",
            400
        );

    }



    // Check student internship

    const studentInternship =
        await StudentInternship.findOne({

            student: req.user._id,

            internship: internshipId

        })
            .populate("student")
            .populate("internship");




    if (!studentInternship) {

        throw new AppError(
            "Internship enrollment not found",
            404
        );

    }



    // Check completion


    if (studentInternship.status !== "Completed") {

        throw new AppError(
            "Complete internship before certificate",
            400
        );

    }




    // Already certificate?


    const existingCertificate =
        await Certificate.findOne({

            student: req.user._id,

            internship: internshipId

        });



    if (existingCertificate) {

        throw new AppError(
            "Certificate already issued",
            409
        );

    }




    // Certificate Number


    const certificateNumber =
        "TM-" + Date.now();




    // Create certificate


    const certificate =
        await Certificate.create({

            student: req.user._id,

            internship: internshipId,

            certificateNumber

        });





    // Generate PDF


    const pdfUrl =
        await generateCertificatePDF(

            certificate,

            studentInternship.student,

            studentInternship.internship

        );




    certificate.pdfUrl = pdfUrl;


    await certificate.save();





    // Send Email


    await sendCertificateEmail(

        studentInternship.student.email,

        pdfUrl

    );





    // Notification


    await Notification.create({

        user: req.user._id,

        title: "Certificate Issued",

        message:
            `Your ${studentInternship.internship.title} internship certificate is ready.`,

        type: "certificate"

    });





    // Activity Log


    await logActivity(

        req,

        req.user._id,

        "CERTIFICATE_ISSUED",

        "Certificate",

        `Certificate generated for ${studentInternship.internship.title}`

    );





    res.status(201).json({

        success: true,

        message:
            "Certificate issued successfully",

        certificate

    });



});








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
// DOWNLOAD CERTIFICATE
// =====================================


export const downloadCertificate =
    asyncHandler(async (req, res) => {

        const certificate =
            await Certificate.findById(req.params.id);

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
