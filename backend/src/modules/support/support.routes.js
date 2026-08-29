import express from "express";

import { protect } from "../../core/security/auth.middleware.js";
import authorizeRoles from "../../core/security/role.middleware.js";

import {
    getMySupportConversation,
    getAdminSupportInbox,
    getSupportMessages,
    updateSupportConversation,
    clearMySupportConversation
} from "./support.controller.js";

import {
    sendStudentSupportMessage
} from "./support.message.controller.js";

const router = express.Router();

router.get(
    "/conversation",
    protect,
    authorizeRoles("student"),
    getMySupportConversation
);

router.post(
    "/conversation/:conversationId/messages",
    protect,
    authorizeRoles("student", "admin"),
    sendStudentSupportMessage
);

router.get(
    "/inbox",
    protect,
    authorizeRoles("admin"),
    getAdminSupportInbox
);

router.get(
    "/conversation/:conversationId/messages",
    protect,
    authorizeRoles("student", "admin"),
    getSupportMessages
);

router.delete(
    "/conversation/:conversationId",
    protect,
    authorizeRoles("student"),
    clearMySupportConversation
);

router.patch(
    "/conversation/:conversationId",
    protect,
    authorizeRoles("admin"),
    updateSupportConversation
);

export default router;
