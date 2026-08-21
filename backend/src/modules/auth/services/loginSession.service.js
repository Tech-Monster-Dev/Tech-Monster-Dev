import RefreshToken from "../models/RefreshToken.js";

import generateToken from "./token/generateToken.js";
import generateRefreshToken from "./token/generateRefreshToken.js";


export const createLoginSession = async (user) => {

    const accessToken =
        generateToken(user);

    const refreshToken =
        generateRefreshToken(user);


    await RefreshToken.deleteMany({
        user: user._id
    });


    await RefreshToken.create({

        user: user._id,

        token: refreshToken,

        expiresAt:
            new Date(
                Date.now() +
                7 * 24 * 60 * 60 * 1000
            )

    });


    return {
        accessToken,
        refreshToken
    };

};
