import express from "express";
import { signup } from "./controllers/signup.controller.js";
import { login } from "./controllers/login.controller.js";
import { verifyOTP, resendOTP } from "./controllers/otp.controller.js";
import { forgotPassword, verifyResetOTP, resetPassword } from "./controllers/password.controller.js";
import { logout, refreshToken } from "./controllers/session.controller.js";
import { adminLogin } from "./controllers/adminAuth.controller.js";
import { loginLimiter, registerLimiter, forgotPasswordLimiter, otpLimiter } from "../../core/security/rateLimiter.middleware.js";
import validate from "../../core/validation/validate.middleware.js";
import { protect } from "../../core/security/auth.middleware.js";

import {registerSchema, loginSchema } from "./auth.validation.js";


const router = express.Router();

router.post("/signup", registerLimiter, validate(registerSchema), signup);
router.post("/login", loginLimiter, validate(loginSchema), login);
router.post("/verify-otp", verifyOTP);
router.post("/resend-otp", otpLimiter, resendOTP);
router.post("/forgot-password", forgotPasswordLimiter, forgotPassword);
router.post("/verify-reset-otp", verifyResetOTP);
router.post("/reset-password", resetPassword);
router.post("/logout", protect, logout);
router.post("/refresh-token", refreshToken);
router.post("/admin/login", loginLimiter, adminLogin);


export default router;