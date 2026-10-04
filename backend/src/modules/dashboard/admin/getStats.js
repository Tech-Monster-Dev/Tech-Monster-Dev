import User from "../../user/models/User.js";
import Internship from "../../internships/models/Internship.js";
import StudentInternship from "../../internships/models/StudentInternship.js";
import { getOnlineUsers } from "../../../infrastructure/socket/socket.js";
import Task from "../../tasks/models/Task.js";
import Certificate from "../../certificates/models/Certificate.js";

const getStats = async () => {
    const onlineUsers = getOnlineUsers();

    const onlineStudentIds = Array.from(onlineUsers.keys());

    const [
        totalStudents,
        totalAdmins,
        totalInternships,
        activeInternships,
        activeStudents,
        completedStudents,
        totalCertificates,
        totalTasks,
        submittedTasks,
        approvedTasks,
        incorrectTasks
    ] = await Promise.all([

        User.countDocuments({
            role: "student"
        }),

        User.countDocuments({
            role: "admin"
        }),

        Internship.countDocuments(),
        Internship.countDocuments({
            status: "Active"
        }),

        User.countDocuments({
            _id: { $in: onlineStudentIds },
            role: "student",
            isBlocked: false
        }),

        StudentInternship.countDocuments({
            status: "Completed"
        }),
        Certificate.countDocuments(),
        Task.countDocuments(),
        Task.countDocuments({
            status: "Submitted"
        }),

        Task.countDocuments({
            status: "Approved"
        }),

        Task.countDocuments({
            status: "Incorrect"
        })
    ]);

    return {
        totalStudents,
        totalAdmins,
        totalInternships,
        activeInternships,
        activeStudents,
        completedStudents,
        totalCertificates,
        totalTasks,
        submittedTasks,
        approvedTasks,
        incorrectTasks
    };
};

export default getStats;