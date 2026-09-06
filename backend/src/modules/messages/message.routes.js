import express from "express";

import { protect } from "../../core/security/auth.middleware.js";
import {
    sendMessage,
    getMessages,
    getChatUsers,
    markAsSeen,
    deleteForMe,
    deleteForEveryone,
    deleteConversationForMe,
    toggleStarMessage,
    searchMessages,
    getMessagesPaginated,
    getStarredMessages,
    toggleChatMute,
    toggleChatBlock,
    getMutedChats,
    getBlockedUsers,
    exportChat
} from "./message.controller.js";

const router = express.Router();

// Send Message
router.post(
    "/",
    protect,
    sendMessage
);

// Get All Chat Users
router.get(
    "/users",
    protect,
    getChatUsers
);

router.get(
    "/search/:userId",
    protect,
    searchMessages
);


router.get(
    "/page/:userId",
    protect,
    getMessagesPaginated
);


router.get(
    "/blocked",
    protect,
    getBlockedUsers
);

// Get Conversation
router.get(
    "/:userId",
    protect,
    getMessages
);

// Mark Messages as Seen
router.patch(
    "/seen/:userId",
    protect,
    markAsSeen
);


router.get(

    "/starred/:userId",

    protect,

    getStarredMessages

);


router.patch(

    "/star/:id",

    protect,

    toggleStarMessage

);


router.delete(

    "/conversation/:userId",

    protect,

    deleteConversationForMe

);

router.delete(

    "/me/:id",

    protect,

    deleteForMe

);

router.delete(

    "/everyone/:id",

    protect,

    deleteForEveryone

);


router.get("/export/:userId", protect, exportChat);

router.get("/muted", protect, getMutedChats);
router.get("/blocked", protect, getBlockedUsers);

router.patch("/mute/:userId", protect, toggleChatMute);
router.patch("/block/:userId", protect, toggleChatBlock);

export default router;