import asyncHandler from "../../../core/http/asyncHandler.js";
import AppError from "../../../core/errors/AppError.js";

import {
    adminLoginUser
} from "../services/adminAuth.service.js";


export const adminLogin = asyncHandler(
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
            await adminLoginUser({

                req,

                email,

                password

            });


        return res.status(200).json({

            success: true,

            message:
                "Admin login successful",

            accessToken:
                result.accessToken,

            refreshToken:
                result.refreshToken,

            user: {

                id:
                    result.user._id,

                username:
                    result.user.username,

                firstname:
                    result.user.firstName,

                lastname:
                    result.user.lastName,

                email:
                    result.user.email,

                role:
                    result.user.role,

                avatar:
                    result.user.avatar

            }

        });

    }
);
