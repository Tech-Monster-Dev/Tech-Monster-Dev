import express from "express";
import { protect } from "../../core/security/auth.middleware.js";

import {
    searchInternships,
    searchUsers,
} from "./search.controller.js";

const router = express.Router();

router.get(
    "/internships",
    searchInternships
);

router.get(
    "/users",
    protect,
    searchUsers
);

export default router;
