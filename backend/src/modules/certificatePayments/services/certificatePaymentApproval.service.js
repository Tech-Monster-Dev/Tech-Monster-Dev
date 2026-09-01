import CertificatePayment from "../models/CertificatePayment.js";

import Certificate from "../../certificates/models/Certificate.js";

import StudentInternship from "../../internships/models/StudentInternship.js";

import Course from "../../courses/models/Course.js";
import Internship from "../../internships/models/Internship.js";

import Notification from "../../notifications/models/Notification.js";

import { generateCertificatePDF } from "../../certificates/services/generateCertificatePDF.js";

import { sendCertificateEmail } from "../../../infrastructure/email/index.js";

import AppError from "../../../core/errors/AppError.js";


/*
 * ==========================================
 * GET PENDING CERTIFICATE PAYMENTS
 * ==========================================
 */

export const getPendingCertificatePayments =
    async () => {

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

export const approveCertificatePayment =
    async (
        paymentId,
        reviewerId
    ) => {

        const payment =
            await CertificatePayment.findById(
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


        const program =
            payment.programType === "course"
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


        /*
         * ==========================================
         * PREVENT DUPLICATE CERTIFICATE
         * ==========================================
         */

        const certificateQuery =
            payment.programType === "course"
                ? {
                    student:
                        payment.student,

                    course:
                        payment.course,
                }
                : {
                    student:
                        payment.student,

                    internship:
                        payment.internship,
                };


        const existingCertificate =
            await Certificate.findOne(
                certificateQuery
            );


        if (existingCertificate) {

            payment.status =
                "approved";

            payment.reviewedBy =
                reviewerId;

            payment.reviewedAt =
                new Date();

            payment.certificate =
                existingCertificate._id;

            await payment.save();


            return {
                payment,
                certificate:
                    existingCertificate,
            };
        }


        /*
         * ==========================================
         * CREATE CERTIFICATE
         * ==========================================
         */

        const certificate =
            await Certificate.create({

                student:
                    payment.student,

                internship:
                    payment.programType ===
                    "internship"
                        ? payment.internship
                        : null,

                course:
                    payment.programType ===
                    "course"
                        ? payment.course
                        : null,

                programType:
                    payment.programType,

                certificateNumber:
                    "TM-" + Date.now(),

            });


        /*
         * ==========================================
         * POPULATE STUDENT
         * ==========================================
         */

        const studentInternship =
            await StudentInternship.findOne({

                student:
                    payment.student,

                ...(payment.programType ===
                    "course"
                    ? {
                        course:
                            payment.course,
                    }
                    : {
                        internship:
                            payment.internship,
                    }),

            }).populate(
                "student"
            );


        if (!studentInternship?.student) {

            await Certificate.findByIdAndDelete(
                certificate._id
            );

            throw new AppError(
                "Student enrollment record not found.",
                404
            );
        }


        /*
         * ==========================================
         * VERIFY PROGRAM COMPLETION
         * ==========================================
         */

        if (
            studentInternship.status !==
            "Completed"
        ) {

            await Certificate.findByIdAndDelete(
                certificate._id
            );

            throw new AppError(
                "Student has not completed the program.",
                400
            );
        }


        /*
         * ==========================================
         * GENERATE CERTIFICATE PDF
         * ==========================================
         */

        const pdfPath =
            await generateCertificatePDF(
                certificate,
                studentInternship.student,
                program
            );


        /*
         * ==========================================
         * SAVE PDF URL
         * ==========================================
         *
         * Existing generator returns a local
         * filesystem path.
         *
         * Keep the path here for now.
         * Cloud/public URL handling can be
         * introduced separately.
         */

        certificate.pdfUrl =
            pdfPath;


        await certificate.save();


        /*
         * ==========================================
         * UPDATE PAYMENT
         * ==========================================
         */

        payment.status =
            "approved";

        payment.reviewedBy =
            reviewerId;

        payment.reviewedAt =
            new Date();

        payment.certificate =
            certificate._id;


        await payment.save();


        /*
         * ==========================================
         * UPDATE STUDENT CERTIFICATE FLAG
         * ==========================================
         */

        studentInternship.certificateIssued =
            true;

        studentInternship.emailFlags =
            studentInternship.emailFlags || {};

        studentInternship.emailFlags
            .certificateEmailSent =
            true;

        await studentInternship.save();


        /*
         * ==========================================
         * SEND CERTIFICATE EMAIL
         * ==========================================
         */

        await sendCertificateEmail(
            studentInternship.student.email,
            pdfPath
        );


        /*
         * ==========================================
         * NOTIFICATION
         * ==========================================
         */

        await Notification.create({

            user:
                payment.student,

            title:
                "Certificate Approved",

            message:
                `Your ${payment.programTitle} certificate has been approved and is ready.`,

            type:
                "certificate",

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

export const rejectCertificatePayment =
    async (
        paymentId,
        reviewerId,
        rejectionReason
    ) => {

        const payment =
            await CertificatePayment.findById(
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


        const reason =
            String(
                rejectionReason || ""
            ).trim();


        if (!reason) {
            throw new AppError(
                "Rejection reason is required.",
                400
            );
        }


        payment.status =
            "rejected";

        payment.reviewedBy =
            reviewerId;

        payment.reviewedAt =
            new Date();

        payment.rejectionReason =
            reason;


        await payment.save();


        await Notification.create({

            user:
                payment.student,

            title:
                "Certificate Payment Rejected",

            message:
                `Your certificate payment for ${payment.programTitle} was rejected. Reason: ${reason}`,

            type:
                "certificate",

        });


        return payment;
    };
