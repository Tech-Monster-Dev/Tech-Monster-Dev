import Follow from "./models/Follow.js";
import User from "../user/models/User.js";
import Notification from "../notifications/models/Notification.js";

import asyncHandler from "../../core/http/asyncHandler.js";
import AppError from "../../core/errors/AppError.js";

import { emitToUser } from "../../infrastructure/socket/socket.js";


// =====================================
// FOLLOW USER
// =====================================

export const followUser = asyncHandler(async (req, res) => {

    const followerId = req.user._id;
    const followingId = req.params.userId;

    // =====================================
    // CANNOT FOLLOW YOURSELF
    // =====================================

    if (
        followerId.toString() ===
        followingId.toString()
    ) {
        throw new AppError(
            "You cannot follow yourself",
            400
        );
    }

    // =====================================
    // FIND TARGET USER
    // =====================================

    const user = await User.findById(followingId)
        .select(
            "username firstName lastName avatar isBlocked"
        );

    if (!user) {
        throw new AppError(
            "User not found",
            404
        );
    }

    if (user.isBlocked) {
        throw new AppError(
            "This user is not available",
            403
        );
    }

    // =====================================
    // CHECK EXISTING FOLLOW
    // =====================================

    const existingFollow = await Follow.findOne({
        follower: followerId,
        following: followingId
    });

    if (existingFollow) {
        throw new AppError(
            "Already following this user",
            400
        );
    }

    // =====================================
    // CREATE FOLLOW
    // =====================================

    await Follow.create({
        follower: followerId,
        following: followingId
    });

    emitToUser(
        followerId,
        "chatUsersUpdated",
        { type: "follow", followerId: followerId.toString(), followingId: followingId.toString() }
    );

    emitToUser(
        followingId,
        "chatUsersUpdated",
        { type: "follow", followerId: followerId.toString(), followingId: followingId.toString() }
    );

    // =====================================
    // GET FOLLOWER DETAILS
    // =====================================

    const follower = await User.findById(followerId)
        .select(
            "username firstName lastName avatar"
        );

    const followerName =
        `${follower?.firstName || ""} ${follower?.lastName || ""}`
            .trim() ||
        follower?.username ||
        "Someone";

    // =====================================
    // CREATE NOTIFICATION
    // =====================================

    const notification = await Notification.create({

        user: followingId,

        title: "New Follower",

        message: `${followerName} started following you`,

        type: "follow",

        context: {
            followerId
        }

    });

    // =====================================
    // SEND LIVE NOTIFICATION
    // =====================================

    emitToUser(
        followingId,
        "newNotification",
        notification
    );

    // =====================================
    // RESPONSE
    // =====================================

    res.status(201).json({

        success: true,

        message: "User followed successfully",

        notification

    });

});


// =====================================
// UNFOLLOW USER
// =====================================

export const unfollowUser = asyncHandler(
    async (req, res) => {

        const followerId = req.user._id;
        const followingId = req.params.userId;


        const follow =
            await Follow.findOneAndDelete({

                follower: followerId,
                following: followingId

            });


        if (!follow) {

            throw new AppError(
                "You are not following this user",
                404
            );

        }

        emitToUser(
            followerId,
            "chatUsersUpdated",
            { type: "unfollow", followerId: followerId.toString(), followingId: followingId.toString() }
        );

        emitToUser(
            followingId,
            "chatUsersUpdated",
            { type: "unfollow", followerId: followerId.toString(), followingId: followingId.toString() }
        );

        res.status(200).json({

            success: true,

            message: "User unfollowed successfully"

        });

    }
);


// =====================================
// GET FOLLOWERS
// =====================================

export const getFollowers = asyncHandler(
    async (req, res) => {

        const userId = req.params.userId;


        const followers =
            await Follow.find({

                following: userId

            })
                .populate(
                    "follower",
                    "username firstName lastName avatar"
                );


        res.status(200).json({

            success: true,

            followers

        });

    }
);


// =====================================
// GET FOLLOWING
// =====================================

export const getFollowing = asyncHandler(
    async (req, res) => {

        const userId = req.params.userId;


        const following =
            await Follow.find({

                follower: userId

            })
                .populate(
                    "following",
                    "username firstName lastName avatar"
                );


        res.status(200).json({

            success: true,

            following

        });

    }
);