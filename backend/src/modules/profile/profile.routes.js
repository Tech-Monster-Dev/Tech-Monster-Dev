import express from "express";

import { uploadProfileImage, updateProfile, getProfile, getUserProfile } from "./profile.controller.js";
import { protect } from "../../core/security/auth.middleware.js";
import upload  from "../../infrastructure/storage/upload.middleware.js";
import validate from "../../core/validation/validate.middleware.js";
import { updateProfileSchema, partialUpdateProfileSchema } from "./profile.validation.js";

const router = express.Router();

router.put(
    "/profile-image",
    protect,
    upload.single("avatar"),
    uploadProfileImage
);

router.get(
    "/",
    protect,
    getProfile
);

router.get(
    "/user/:userId",
    protect,
    getUserProfile
);

router.put(
    "/",
    protect,
    validate(updateProfileSchema),
    updateProfile
);



router.patch(
    "/",
    protect,
    validate(partialUpdateProfileSchema),
    updateProfile
);

export default router;