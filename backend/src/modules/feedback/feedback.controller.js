import asyncHandler from "../../core/http/asyncHandler.js";

import {
    createFeedback,
    getPublicWebsiteFeedback,
    getStudentResourceFeedback
} from "./feedback.service.js";

export const submitFeedback = asyncHandler(
    async (req, res) => {
        const feedback = await createFeedback({
            studentId: req.user._id,
            ...req.body
        });

        return res.status(201).json({
            success: true,
            message: "Feedback submitted successfully",
            feedback
        });
    }
);

export const getWebsiteFeedback = asyncHandler(
    async (req, res) => {
        const feedback = await getPublicWebsiteFeedback({
            limit: req.query.limit
        });

        return res.status(200).json({
            success: true,
            feedback
        });
    }
);
export const getMyResourceFeedback = asyncHandler(
    async (req, res) => {
        const type = req.params.type;
        const validTypes = ["course", "internship"];
        if (validTypes.indexOf(type) === -1) {
            return res.status(400).json({
                success: false,
                message: "Invalid feedback type"
            });
        }

        const feedback = await getStudentResourceFeedback({
            studentId: req.user._id,
            type,
            limit: req.query.limit
        });

        return res.status(200).json({
            success: true,
            feedback
        });
    }
);
