import User from "../user/models/User.js";
import Follow from "../follow/models/Follow.js";
import Internship from "../internships/models/Internship.js";
import StudentInternship from "../internships/models/StudentInternship.js";
import UserBadge from "./models/UserBadge.js";
import Badge from "./models/Badges.js";
import Certificate from "../certificates/models/Certificate.js";
import Course from "../courses/models/Course.js";

import uploadToCloudinary from "../../infrastructure/storage/uploadCloudinary.js";

import asyncHandler from "../../core/http/asyncHandler.js";
import AppError from "../../core/errors/AppError.js";

// =====================================
// PROFILE STATS
// =====================================

const getProfileStats = async (userId) => {

    const [
        followersCount,
        followingCount,
        completedInternships,
        totalInternships,
        completedCourses,
        totalCourses
    ] = await Promise.all([

        Follow.countDocuments({
            following: userId
        }),

        Follow.countDocuments({
            follower: userId
        }),

        StudentInternship.countDocuments({
            student: userId,
            internship: { $exists: true, $ne: null },
            status: "Completed"
        }),

        Internship.countDocuments({
            isPublished: true
        }),

        StudentInternship.countDocuments({
            student: userId,
            course: { $exists: true, $ne: null },
            status: "Completed"
        }),

        Course.countDocuments({
            isPublished: true
        })

    ]);

    const stats = {
        followersCount,
        followingCount,
        completedInternships,
        totalInternships,
        completedCourses,
        totalCourses
    };

    console.log("PROFILE STATS:", stats);

    return stats;
};


// =====================================
// UPLOAD PROFILE IMAGE
// =====================================

export const uploadProfileImage = asyncHandler(
    async (req, res) => {

        console.log(
            "req.file",
            req.file
        );


        if (!req.file) {

            throw new AppError(
                "Please upload an image",
                400
            );

        }


        const imageUrl =
            await uploadToCloudinary(
                req.file,
                "tech-monster/profile"
            );


        const user =
            await User.findByIdAndUpdate(

                req.user.id,

                {
                    avatar: imageUrl
                },

                {
                    new: true
                }

            );


        res.status(200).json({

            success: true,

            message:
                "Profile image uploaded successfully",

            user

        });

    }
);


// =====================================
// UPDATE PROFILE
// =====================================

export const updateProfile = asyncHandler(
    async (req, res) => {

        const user =
            await User.findById(
                req.user._id
            );


        if (!user) {

            throw new AppError(
                "User not found",
                404
            );

        }


        const allowedFields = [

            "firstName",
            "middleName",
            "lastName",

            "phone",
            "bio",
            "gender",
            "dateOfBirth",

            "education",
            "college",
            "branch",
            "year",
            "semester",

            "github",
            "linkedin",
            "skills",

            "currentAddress",
            "localAddress",
            "district",
            "state",
            "pincode"

        ];


        allowedFields.forEach(
            (field) => {

                if (
                    req.body[field] !==
                    undefined
                ) {

                    user[field] =
                        req.body[field];

                }

            }
        );


        user.profileCompleted = true;


        await user.save();


        const stats = await getProfileStats(
            user._id
        );


        res.status(200).json({

            success: true,

            message:
                "Profile updated",

            user,

            stats

        });

    }
);


// =====================================
// GET PROFILE
// =====================================

export const getProfile = asyncHandler(
    async (req, res) => {

        const user =
            await User.findById(
                req.user._id
            )
                .select("-password");


        if (!user) {

            throw new AppError(
                "User not found",
                404
            );

        }


        const stats = await getProfileStats(
            user._id
        );

        const latestBadge = await UserBadge.findOne({
            user: user._id
        })
            .populate(
                "badge",
                "title icon description color requirement category"
            )
            .sort({
                earnedAt: -1
            })
            .lean();

        res.status(200).json({

            success: true,

            user,

            stats,

            latestBadge: latestBadge?.badge
                ? {
                    _id: latestBadge.badge._id,
                    title: latestBadge.badge.title,
                    icon: latestBadge.badge.icon,
                    description: latestBadge.badge.description,
                    color: latestBadge.badge.color,
                    requirement: latestBadge.badge.requirement,
                    category: latestBadge.badge.category,
                    earnedAt: latestBadge.earnedAt
                }
                : null

        });

    }
);


// =====================================
// GET OTHER USER PROFILE
// =====================================

export const getUserProfile = asyncHandler(async (req, res) => {

    const { userId } = req.params;

    // ---------------------------------
    // Validate target user
    // ---------------------------------

    const user = await User.findById(userId)
        .select("-password -refreshToken");

    if (!user) {
        throw new AppError(
            "User profile not found",
            404
        );
    }

    // ---------------------------------
    // Followers / Following count
    // ---------------------------------

    const followersCount = await Follow.countDocuments({
        following: userId
    });

    const followingCount = await Follow.countDocuments({
        follower: userId
    });

    // ---------------------------------
    // Check current logged-in user
    // follows target user or not
    // ---------------------------------

    const existingFollow = await Follow.exists({
        follower: req.user._id,
        following: userId
    });

    const isFollowing = !!existingFollow;

    // ---------------------------------
    // User internships / courses
    // ---------------------------------

    const enrollments = await StudentInternship.find({
        student: userId
    })
        .populate(
            "internship",
            "title slug category level thumbnail"
        )
        .populate(
            "course",
            "title slug category level thumbnail"
        )
        .sort({
            createdAt: -1
        });

    const internships = enrollments
        .filter(item => item.internship)
        .map(item => ({
            _id: item.internship._id,
            title: item.internship.title,
            slug: item.internship.slug,
            category: item.internship.category,
            level: item.internship.level,
            thumbnail: item.internship.thumbnail,
            progress: item.progress,
            status: item.status
        }));

    const courses = enrollments
        .filter(item => item.course)
        .map(item => ({
            _id: item.course._id,
            title: item.course.title,
            slug: item.course.slug,
            category: item.course.category,
            level: item.course.level,
            thumbnail: item.course.thumbnail,
            progress: item.progress,
            status: item.status
        }));

    // ---------------------------------
    // Certificates
    // ---------------------------------

    const certificates = await Certificate.find({
        student: userId
    })
        .populate(
            "internship",
            "title slug"
        )
        .sort({
            issueDate: -1
        });

    // ---------------------------------
    // Badges
    // ---------------------------------

    const badges = await UserBadge.find({
        user: userId
    })
        .populate(
            "badge",
            "title icon description color requirement"
        )
        .sort({
            earnedAt: -1
        });

    // ---------------------------------
    // Response
    // ---------------------------------

    return res.status(200).json({

        success: true,

        user,

        followersCount,

        followingCount,

        isFollowing,

        internships,

        courses,

        certificates,

        badges

    });

});