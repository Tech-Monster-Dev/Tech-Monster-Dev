import mongoose from "mongoose";

import Feedback from "./models/Feedback.js";
import StudentInternship from "../internships/models/StudentInternship.js";
import Course from "../courses/models/Course.js";
import Internship from "../internships/models/Internship.js";

import AppError from "../../core/errors/AppError.js";
import { moderateFeedbackText } from "./utils/moderation.js";
import { getIO } from "../../infrastructure/socket/socket.js";
import { getStudentResourceFeedback } from "./feedback.query.service.js";

const PROFILE_FIELDS = "username firstName lastName avatar";

const getRelatedResource = async ({ type, courseId, internshipId }) => {
    if (type === "course") {
        if (!mongoose.isValidObjectId(courseId)) {
            throw new AppError("Invalid course ID", 400);
        }

        const course = await Course.findById(courseId).select("_id title");

        if (!course) {
            throw new AppError("Course not found", 404);
        }

        return course;
    }

    if (type === "internship") {
        if (!mongoose.isValidObjectId(internshipId)) {
            throw new AppError("Invalid internship ID", 400);
        }

        const internship =
            await Internship.findById(internshipId).select("_id title");

        if (!internship) {
            throw new AppError("Internship not found", 404);
        }

        return internship;
    }

    return null;
};

const verifyEnrollment = async ({ studentId, type, resourceId }) => {
    const query = {
        student: studentId,
        [type]: resourceId
    };

    const enrollment = await StudentInternship.findOne(query);

    if (!enrollment) {
        throw new AppError(
            `You are not enrolled in this ${type}`,
            403
        );
    }

    return enrollment;
};

const buildPublicFeedback = (feedback) => ({
    _id: feedback._id,
    type: feedback.type,
    subject: feedback.subject,
    message: feedback.message,
    rating: feedback.rating,
    course: feedback.course
        ? {
            _id: feedback.course._id,
            title: feedback.course.title
        }
        : null,
    internship: feedback.internship
        ? {
            _id: feedback.internship._id,
            title: feedback.internship.title
        }
        : null,
    student: feedback.student
        ? {
            _id: feedback.student._id,
            username: feedback.student.username,
            firstName: feedback.student.firstName,
            lastName: feedback.student.lastName,
            avatar: feedback.student.avatar
        }
        : null,
    createdAt: feedback.createdAt
});

export const createFeedback = async ({
    studentId,
    type,
    subject,
    message,
    rating,
    courseId,
    internshipId
}) => {
    const moderation = moderateFeedbackText({
        subject,
        message
    });

    const relatedResource = await getRelatedResource({
        type,
        courseId,
        internshipId
    });

    if (type === "course") {
        await verifyEnrollment({
            studentId,
            type: "course",
            resourceId: relatedResource._id
        });
    }

    if (type === "internship") {
        await verifyEnrollment({
            studentId,
            type: "internship",
            resourceId: relatedResource._id
        });
    }

    const isPublic =
        type === "website" &&
        rating >= 3 &&
        moderation.isAllowed;

    const feedback = await Feedback.create({
        student: studentId,
        type,
        subject,
        message,
        rating,
        course: type === "course" ? relatedResource._id : null,
        internship:
            type === "internship" ? relatedResource._id : null,
        isPublic,
        moderationStatus: moderation.isAllowed
            ? "approved"
            : "rejected",
        moderationReason: moderation.reason
    });

    const populatedFeedback = await Feedback.findById(feedback._id)
        .populate("student", PROFILE_FIELDS)
        .populate("course", "_id title")
        .populate("internship", "_id title");

    const response = {
        ...buildPublicFeedback(populatedFeedback),
        moderation: {
            isAllowed: moderation.isAllowed,
            reason: moderation.reason
        }
    };

    const feedbackPayload = {
        feedback: buildPublicFeedback(populatedFeedback)
    };

    const io = getIO();
    io.to(String(studentId)).emit("feedbackCreated", feedbackPayload);

    if (isPublic) {
        io.emit("feedbackCreated", feedbackPayload);
    }

    return response;
};

export const getPublicWebsiteFeedback = async ({
    limit = 5
} = {}) => {
    const feedback = await Feedback.find({
        type: "website",
        rating: { $gte: 3, $lte: 5 },
        isPublic: true,
        moderationStatus: "approved"
    })
        .populate("student", PROFILE_FIELDS)
        .sort({ createdAt: -1 })
        .limit(Math.min(Number(limit) || 5, 5))
        .lean();

    return feedback.map(buildPublicFeedback);
};

export { getStudentResourceFeedback };
