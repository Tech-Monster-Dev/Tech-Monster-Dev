import Certificate from "./models/Certificate.js";
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


        const certificates =
            await Certificate.find({

                student: req.user._id

            })

                .populate(
                    "internship",
                    "title category duration"
                )

                .sort({

                    createdAt: -1

                });




        res.status(200).json({

            success: true,

            certificates

        });



    });








// =====================================
// DOWNLOAD CERTIFICATE
// =====================================


export const downloadCertificate =
    asyncHandler(async (req, res) => {


        const certificate =
            await Certificate.findById(

                req.params.id

            );



        if (!certificate) {

            throw new AppError(
                "Certificate not found",
                404
            );

        }




        if (

            certificate.student.toString()
            !==
            req.user._id.toString()

        ) {

            throw new AppError(
                "Unauthorized access",
                403
            );

        }





        res.status(200).json({

            success: true,

            pdfUrl: certificate.pdfUrl

        });



    });