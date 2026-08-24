import jwt from "jsonwebtoken";

import RefreshToken from "../models/RefreshToken.js";

import generateToken from "./token/generateToken.js";

import logActivity from "../../activity/logActivity.js";


export const logoutUser = async ({
    req
}) => {

    await logActivity(
        req,
        req.user._id,
        "LOGOUT",
        "Auth",
        "User logged out"
    );


    await RefreshToken.deleteMany({
        user: req.user._id
    });

};


export const refreshAccessToken = async ({
    refreshToken
}) => {

    if (!refreshToken) {

        const error =
            new Error(
                "Refresh token required"
            );

        error.statusCode = 401;

        throw error;
    }


    const savedToken =
        await RefreshToken.findOne({
            token: refreshToken
        });


    if (!savedToken) {

        const error =
            new Error(
                "Invalid refresh token"
            );

        error.statusCode = 401;

        throw error;
    }


    const decoded =
        jwt.verify(
            refreshToken,
            process.env.JWT_REFRESH_SECRET
        );


    const accessToken =
        generateToken(decoded.id);


    return accessToken;

};
