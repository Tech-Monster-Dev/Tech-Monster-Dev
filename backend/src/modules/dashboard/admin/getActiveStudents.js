import User from "../../user/models/User.js";
import StudentInternship from "../../internships/models/StudentInternship.js";
import Task from "../../tasks/models/Task.js";

const getActiveStudents = async () => {
    const students = await User.find({
        role: "student",
        isBlocked: false
    })
        .select(
            "firstName lastName avatar lastLogin createdAt"
        )
        .sort({
            lastLogin: -1
        })
        .limit(8);

    const result = await Promise.all(
        students.map(async (student) => {
            const [
                joinedInternships,
                pendingTasks,
                completedTasks
            ] = await Promise.all([
                StudentInternship.countDocuments({
                    student: student._id
                }),

                Task.countDocuments({
                    assignedTo: student._id,
                    status: "Pending"
                }),

                Task.countDocuments({
                    assignedTo: student._id,
                    status: "Completed"
                })
            ]);

            return {
                _id: student._id,
                avatar: student.avatar,
                fullName: `${student.firstName} ${student.lastName}`,
                joinedInternships,
                pendingTasks,
                completedTasks,
                lastLogin: student.lastLogin,
                joinedAt: student.createdAt
            };
        })
    );
    return result;
};

export default getActiveStudents;