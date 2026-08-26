import Submission from "../models/Submission.js";

export const getMySubmissions =
    async (studentId) => {
        return Submission.find({
            student: studentId,
        }).sort({
            updatedAt: -1,
        });
    };