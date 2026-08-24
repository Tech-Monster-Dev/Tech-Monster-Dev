import bcrypt from "bcrypt";

import User from "../../user/models/User.js";

import logActivity from "../../activity/logActivity.js";

import {
    createLoginSession
} from "./loginSession.service.js";


export const loginUser = async ({
    req,
    email,
    password
}) => {

    const user =
        await User.findOne({ email })
            .select("+password");


    if (!user) {

        const error =
            new Error(
                "Invalid email or password"
            );

        error.statusCode = 401;

        throw error;
    }


    if (user.isBlocked) {

        return {
            blocked: true
        };

    }


    const isMatch =
        await bcrypt.compare(
            password,
            user.password
        );


    if (!isMatch) {

        const error =
            new Error(
                "Invalid email or password"
            );

        error.statusCode = 401;

        throw error;
    }


    if (!user.isVerified) {

        const error =
            new Error(
                "Please verify your email first."
            );

        error.statusCode = 403;

        throw error;
    }


    const session =
        await createLoginSession(user);


    await logActivity(

        req,

        user._id,

        "LOGIN",

        "Auth",

        "User logged in successfully"

    );


    return {

        ...session,

        user

    };

};
