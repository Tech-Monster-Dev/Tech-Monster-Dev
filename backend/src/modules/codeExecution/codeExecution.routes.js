import express from "express";

import { protect } from "../../core/security/auth.middleware.js";
import authorizeRoles from "../../core/security/role.middleware.js";
import { executeCode } from "./codeExecution.controller.js";

const router = express.Router();

router.post(
    "/execute",
    protect,
    authorizeRoles("student"),
    executeCode
);

export default router;
