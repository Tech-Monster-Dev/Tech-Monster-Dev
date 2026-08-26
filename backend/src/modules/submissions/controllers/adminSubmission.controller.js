import Submission from "../models/Submission.js";

import asyncHandler from "../../../core/http/asyncHandler.js";

import {
    approveSubmission as approve,
} from "../services/submissionApproval.service.js";

import {
    rejectSubmission as reject,
} from "../services/submissionReview.service.js";

import {
    extendDeadline,
} from "../services/submissionDeadline.service.js";

export const getAllSubmissions =
    asyncHandler(
        async (req, res) => {
            const {
                status,
            } = req.query;

            const now =
                new Date();

            await Submission.updateMany(
                {
                    status: {
                        $in: [
                            "unlocked",
                            "pending",
                            "rejected",
                        ],
                    },

                    expiresAt: {
                        $lte: now,
                    },
                },
                {
                    $set: {
                        status:
                            "expired",

                        expiredAt:
                            now,
                    },
                }
            );

            const filter = {};

            if (
                status &&
                [
                    "locked",
                    "unlocked",
                    "pending",
                    "approved",
                    "rejected",
                    "expired",
                ].includes(status)
            ) {
                filter.status =
                    status;
            }

            const submissions =
                await Submission.find(
                    filter
                )
                    .populate(
                        "student",
                        "firstName lastName username email avatar"
                    )
                    .populate(
                        "internship",
                        "title slug"
                    )
                    .sort({
                        submittedAt:
                            -1,
                    });

            return res.status(200).json({
                success: true,
                total:
                    submissions.length,
                submissions,
            });
        }
    );

export const getSubmissionDetails =
    asyncHandler(
        async (req, res) => {
            const submission =
                await Submission.findById(
                    req.params.id
                )
                    .populate(
                        "student",
                        "firstName lastName username email avatar github linkedin"
                    )
                    .populate(
                        "internship",
                        "title slug description"
                    );

            if (!submission) {
                const error =
                    new Error(
                        "Submission not found"
                    );

                error.statusCode =
                    404;

                throw error;
            }

            return res.status(200).json({
                success: true,
                submission,
            });
        }
    );

export const approveSubmission =
    asyncHandler(
        async (req, res) => {
            const result =
                await approve(
                    req.params.id,
                    req.user._id,
                    req.body.comment
                );

            return res.status(200).json({
                success: true,

                message:
                    "Submission approved successfully.",

                ...result,
            });
        }
    );

export const rejectSubmission =
    asyncHandler(
        async (req, res) => {
            const submission =
                await reject(
                    req.params.id,
                    req.user._id,
                    req.body.comment
                );

            return res.status(200).json({
                success: true,

                message:
                    "Submission rejected successfully.",

                submission,
            });
        }
    );

export const extendSubmissionDeadline =
    asyncHandler(
        async (req, res) => {
            const submission =
                await extendDeadline(
                    req.params.id,
                    req.user._id,
                    req.body.hours
                );

            return res.status(200).json({
                success: true,

                message:
                    "Deadline extended successfully.",

                submission,
            });
        }
    );