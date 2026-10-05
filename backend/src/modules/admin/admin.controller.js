import User from "../user/models/User.js";
import Notification from "../notifications/models/Notification.js";
import Attendance from "../attendance/models/Attendance.js";
import AttendanceActivity from "../attendance/models/AttendanceActivity.js";
import Course from "../courses/models/Course.js";
import StudentInternship from "../internships/models/StudentInternship.js";
import Internship from "../internships/models/Internship.js";

import logActivity from "../activity/logActivity.js";
import asyncHandler from "../../core/http/asyncHandler.js";
import AppError from "../../core/errors/AppError.js";
import deleteAccountData from "../user/services/deleteAccount.service.js";
import DeletedStudentBackup from "../user/models/DeletedStudentBackup.js";
import restoreDeletedStudent from "../user/services/restoreDeletedStudent.service.js";

export const getDashboardStats = asyncHandler(async (req, res) => {
    const totalUsers = await User.countDocuments();

    const totalStudents = await User.countDocuments({
        role: "student"
    });

    const totalAdmins = await User.countDocuments({
        role: "admin"
    });

    const totalInternships = await Internship.countDocuments();

    const activeInternships = await Internship.countDocuments({
        isPublished: true
    });

    return res.status(200).json({
        success: true,
        stats: {
            totalUsers,
            totalStudents,
            totalEmployers,
            totalAdmins,
            totalCompanies,
            verifiedCompanies,
            totalInternships,
            activeInternships,
            totalApplications
        }
    });
});

export const getAllUsers = asyncHandler(async (req, res) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = req.query.search || "";
    const role = req.query.role || "";
    const query = {};

    if (search) {
        query.$or = [
            {
                firstName: {
                    $regex: search,
                    $options: "i"
                }
            },

            {
                lastName: {
                    $regex: search,
                    $options: "i"
                }
            },

            {
                email: {
                    $regex: search,
                    $options: "i"
                }
            }
        ];
    }

    if (role) {
        query.role = role;
    }

    if (role === "student") {
        const activeUsers = await User.find(query)
            .select("-password -refreshToken")
            .lean();

        const backups = await DeletedStudentBackup.find({})
            .select("originalUserId snapshot.user deletedAt")
            .lean();

        const deletedUsers = backups
            .map((backup) => {
                const user = { ...(backup.snapshot?.user || {}) };
                delete user.password;
                delete user.refreshToken;

                return {
                    ...user,
                    _id: backup.originalUserId,
                    isDeleted: true,
                    deletedAt: backup.deletedAt,
                };
            })
            .filter((student) => {
                if (!search) return true;

                const value = `${student.firstName || ""} ${student.lastName || ""} ${student.email || ""}`;
                return value.toLowerCase().includes(search.toLowerCase());
            });

        const combinedUsers = [...activeUsers, ...deletedUsers].sort(
            (a, b) =>
                new Date(b.createdAt || b.deletedAt || 0) -
                new Date(a.createdAt || a.deletedAt || 0)
        );

        const totalStudentUsers = combinedUsers.length;
        const users = combinedUsers.slice(
            (page - 1) * limit,
            page * limit
        );

        return res.status(200).json({
            success: true,
            currentPage: page,
            totalPages: Math.ceil(totalStudentUsers / limit),
            totalUsers: totalStudentUsers,
            users,
        });
    }

    const totalUsers = await User.countDocuments(query);

    const users = await User.find(query)
        .select("-password")
        .sort({
            createdAt: -1
        })
        .skip((page - 1) * limit)
        .limit(limit);

    return res.status(200).json({
        success: true,
        currentPage: page,
        totalPages: Math.ceil(totalUsers / limit),
        totalUsers,
        users
    });
});

export const blockUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        throw new AppError(
            "User not found",
            404
        );
    }

    if (user.role === "admin") {
        throw new AppError(
            "Admin account cannot be blocked",
            403
        );
    }

    user.isBlocked = true;
    await user.save();

    await logActivity(
        req,
        req.user._id,
        "BLOCK_USER",
        "Admin",
        `Blocked user: ${user.email}`
    );

    return res.status(200).json({
        success: true,
        message: "User blocked successfully",
        user
    });
});

export const unblockUser = asyncHandler(async (req, res) => {
    const user = await User.findById(
        req.params.id
    );

    if (!user) {
        throw new AppError(
            "User not found",
            404
        );
    }

    user.isBlocked = false;
    await user.save();

    await logActivity(
        req,
        req.user._id,
        "UNBLOCK_USER",
        "Admin",
        `Unblocked user: ${user.email}`
    );

    return res.status(200).json({
        success: true,
        message: "User unblocked successfully",
        user
    });
});

export const deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findById(
        req.params.id
    );

    if (!user) {
        throw new AppError(
            "User not found",
            404
        );
    }

    if (user.role === "admin") {
        throw new AppError(
            "Admin account cannot be deleted",
            403
        );
    }

    await deleteAccountData(user, req.user._id);

    await logActivity(
        req,
        req.user._id,
        "DELETE_USER",
        "Admin",
        `Deleted user: ${user.email}`
    );

    return res.status(200).json({
        success: true,
        message: "User deleted successfully"
    });
});

export const restoreUser = asyncHandler(async (req, res) => {
    await restoreDeletedStudent(req.params.id);

    return res.status(200).json({
        success: true,
        message: "Student restored successfully"
    });
});

export const getSingleUser = asyncHandler(async (req, res) => {
    const student = await User.findById(req.params.id)
        .select("-password -refreshToken");

    if (!student) {
        throw new AppError("Student not found", 404);
    }

    const enrollments = await StudentInternship.find({
        student: student._id
    })
        .populate("course")
        .populate("internship");

    const courses = enrollments.filter(
        (enrollment) => enrollment.course
    );

    const internships = enrollments.filter(
        (enrollment) => enrollment.internship
    );

    const attendanceRecords = await Attendance.find({
        student: student._id
    })
        .populate("course", "title")
        .populate("internship", "title")
        .sort({
            createdAt: -1
        });

    const attendance = await Promise.all(
        attendanceRecords.map(async (record) => {
            const attendanceDate = new Intl.DateTimeFormat("en-CA", {
                timeZone: "Asia/Kolkata",
                year: "numeric",
                month: "2-digit",
                day: "2-digit"
            }).format(new Date(record.createdAt));

            const activityDate = new Date(
                attendanceDate + "T00:00:00+05:30"
            );

            const activity = await AttendanceActivity.findOne({
                student: student._id,
                date: activityDate,
                course: record.course?._id || null,
                internship: record.internship?._id || null
            }).select("activeSeconds");

            return {
                ...record.toObject(),
                activeSeconds: activity?.activeSeconds || 0
            };
        })
    );

    const adminIds = await User.find({
        role: "admin"
    }).distinct("_id");

    const notifications = await Notification.find({
        user: student._id,
        sender: { $in: adminIds }
    })
        .sort({
            createdAt: -1
        })
        .limit(10)
        .populate(
            "sender",
            "firstName middleName lastName username"
        );

    res.status(200).json({
        success: true,
        student,
        courses,
        internships,
        attendance,
        notifications
    });
});


// backend/controllers/admin.controller.js
export const getEnrolledPrograms = asyncHandler(async (req, res) => {
    const enrollments = await StudentInternship.find({})
        .populate(
            "student",
            "firstName middleName lastName username email avatar"
        )
        .populate("course")
        .populate("internship")
        .sort({
            startedAt: -1,
            createdAt: -1
        });

    const courseMap = new Map();
    const internshipMap = new Map();

    for (const enrollment of enrollments) {
        const program = enrollment.course || enrollment.internship;
        const student = enrollment.student;

        if (!program || !student) {
            continue;
        }

        const isCourse = Boolean(enrollment.course);
        const targetMap = isCourse
            ? courseMap
            : internshipMap;
        const programId = String(program._id);

        if (!targetMap.has(programId)) {
            targetMap.set(programId, {
                ...program.toObject(),
                students: []
            });
        }

        targetMap.get(programId).students.push({
            ...student.toObject(),
            enrollmentId: enrollment._id,
            startedAt:
                enrollment.startedAt ||
                enrollment.createdAt
        });
    }

    res.status(200).json({
        success: true,
        courses: Array.from(courseMap.values()),
        internships: Array.from(internshipMap.values())
    });
});

export const updateUser = asyncHandler(async (req, res) => {
    const student = await User.findById(req.params.id);

    if (!student) {
        throw new AppError("Student not found", 404);
    }

    const {
        firstName,
        middleName,
        lastName,
        username,
        email,
        phone,
        bio,
        gender,
        dateOfBirth,
        education,
        college,
        branch,
        year,
        semester,
        github,
        linkedin,
        skills,
        currentAddress,
        localAddress,
        district,
        state,
        pincode
    } = req.body;

    student.firstName = firstName ?? student.firstName;
    student.middleName = middleName ?? student.middleName;
    student.lastName = lastName ?? student.lastName;
    student.username = username ?? student.username;
    student.email = email ?? student.email;
    student.phone = phone ?? student.phone;
    student.bio = bio ?? student.bio;
    student.gender = gender ?? student.gender;
    student.dateOfBirth = dateOfBirth ?? student.dateOfBirth;
    student.education = education ?? student.education;
    student.college = college ?? student.college;
    student.branch = branch ?? student.branch;
    student.year = year ?? student.year;
    student.semester = semester ?? student.semester;
    student.github = github ?? student.github;
    student.linkedin = linkedin ?? student.linkedin;
    student.skills = skills ?? student.skills;
    student.currentAddress = currentAddress ?? student.currentAddress;
    student.localAddress = localAddress ?? student.localAddress;
    student.district = district ?? student.district;
    student.state = state ?? student.state;
    student.pincode = pincode ?? student.pincode;

    await student.save();

    res.status(200).json({
        success: true,
        message: "Student updated successfully",
        student
    });
});