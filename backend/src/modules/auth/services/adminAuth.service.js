import bcrypt from "bcrypt";

import User from "../../user/models/User.js";

import generateToken from "./token/generateToken.js";
import generateRefreshToken from "./token/generateRefreshToken.js";

import logActivity from "../../activity/logActivity.js";


export const adminLoginUser = async ({
    req,
    email,
    password
}) => {

    const user =
        await User.findOne({
            email
        }).select("+password");


    if (!user) {

        const error =
            new Error(
                "Invalid admin credentials"
            );

        error.statusCode = 401;

        throw error;

    }


    if (user.role !== "admin") {

        const error =
            new Error(
                "Access denied. Admin only."
            );

        error.statusCode = 403;

        throw error;

    }


    const isMatch =
        await bcrypt.compare(
            password,
            user.password
        );


    if (!isMatch) {

        const error =
            new Error(
                "Invalid admin credentials"
            );

        error.statusCode = 401;

        throw error;

    }


    const accessToken =
        generateToken(user);


    const refreshToken =
        generateRefreshToken(user);


    await logActivity(
        req,
        user._id,
        "ADMIN_LOGIN",
        "Auth",
        "Admin logged in successfully"
    );


    return {

        accessToken,

        refreshToken,

        user

    };

};
