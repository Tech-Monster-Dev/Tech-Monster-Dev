import asyncHandler from "../../../core/http/asyncHandler.js";

import {
    createSubmission,
} from "../services/submissionCreate.service.js";

import {
    getMySubmissions as fetchMySubmissions,
} from "../services/submissionQuery.service.js";

import {
    getMyCourseSubmissions as fetchMyCourseSubmissions,
} from "../services/submissionCourseQuery.service.js";

export const submitCode =
    asyncHandler(
        async (req, res) => {
            const submission =
                await createSubmission({
                    req,
                });

            return res.status(200).json({
                success: true,

                message:
                    "Task submitted successfully. Waiting for admin approval.",

                submission,
            });
        }
    );

export const getMySubmissions =
    asyncHandler(
        async (req, res) => {
            const submissions =
                await fetchMySubmissions(
                    req.user._id
                );

            return res.status(200).json({
                success: true,
                submissions,
            });
        }
    );

export const getMyCourseSubmissions =
    asyncHandler(
        async (req, res) => {
            const result =
                await fetchMyCourseSubmissions(
                    req.user._id,
                    req.params.courseSlug
                );

            return res.status(200).json({
                success: true,
                ...result,
            });
        }
    );