import asyncHandler from "../../../core/http/asyncHandler.js";
import AppError from "../../../core/errors/AppError.js";

import {
    loginUser
} from "../services/login.service.js";


export const login = asyncHandler(
    async (req, res) => {

        const {
            email,
            password
        } = req.body;


        if (!email || !password) {

            throw new AppError(
                "Email and Password are required",
                400
            );

        }


        const result =
            await loginUser({

                req,

                email,

                password

            });


        if (result.blocked) {

            return res.status(403).json({

                success: false,

                statusCode: 403,

                message:
                    "Your account has been blocked."

            });

        }


        const {
            user,
            accessToken,
            refreshToken
        } = result;


        return res.status(200).json({

            success: true,

            message:
                "Login successful",

            accessToken,

            refreshToken,

            user: {

                id: user._id,

                username: user.username,

                firstname: user.firstName,

                lastname: user.lastName,

                email: user.email,

                role: user.role,

                avatar: user.avatar

            }

        });

    }
);
