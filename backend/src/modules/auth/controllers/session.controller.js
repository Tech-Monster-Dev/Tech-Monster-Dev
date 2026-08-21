import asyncHandler from "../../../core/http/asyncHandler.js";

import {
    logoutUser,
    refreshAccessToken
} from "../services/session.service.js";


// ==========================================
// LOGOUT
// ==========================================

export const logout = asyncHandler(
    async (req, res) => {

        await logoutUser({
            req
        });

        return res.status(200).json({
            success: true,
            message: "Logout successful"
        });

    }
);


// ==========================================
// REFRESH ACCESS TOKEN
// ==========================================

export const refreshToken = asyncHandler(
    async (req, res) => {

        const {
            refreshToken
        } = req.body;


        const accessToken =
            await refreshAccessToken({
                refreshToken
            });


        return res.status(200).json({

            success: true,

            accessToken

        });

    }
);
