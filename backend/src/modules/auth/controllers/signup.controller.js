import asyncHandler from "../../../core/http/asyncHandler.js";
import AppError from "../../../core/errors/AppError.js";

import {
    signupUser
} from "../services/signup.service.js";


export const signup = asyncHandler(
    async (req, res) => {

        const {
            username,
            email,
            password,
            terms
        } = req.body;


        if (
            !username ||
            !email ||
            !password
        ) {
            throw new AppError(
                "All fields are required",
                400
            );
        }


        const result = await signupUser({
            req,
            username,
            email,
            password,
            terms
        });


        return res.status(201).json({

            success: true,
            message: "Account created. OTP sent to your email.",
            email: result.email

        });

    }
);
