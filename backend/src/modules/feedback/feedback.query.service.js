import Feedback from "./models/Feedback.js";
import StudentInternship from "../internships/models/StudentInternship.js";

const PROFILE_FIELDS = "username firstName lastName avatar";

export const getStudentResourceFeedback = async ({
    studentId,
    type,
    limit = 5
}) => {
    const resourceField = type === "course" ? "course" : "internship";
    const enrollments = await StudentInternship.find({
        student: studentId,
        [resourceField]: { $ne: null }
    }).select(resourceField).lean();

    const resourceIds = enrollments
        .map((item) => item[resourceField])
        .filter(Boolean);

    if (resourceIds.length === 0) {
        return [];
    }

    const feedback = await Feedback.find({
        type,
        [resourceField]: { $in: resourceIds }
    })
        .populate("student", PROFILE_FIELDS)
        .populate("course", "_id title")
        .populate("internship", "_id title")
        .sort({ createdAt: -1 })
        .limit(Math.min(Number(limit) || 5, 5))
        .lean();

    return feedback;
};
