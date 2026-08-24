import rateLimit from "express-rate-limit";

export const loginLimiter = rateLimit({

    windowMs: 15 * 60 * 1000,

    max: 20,

    standardHeaders: true,

    legacyHeaders: false,

    handler: (req, res) => {
    res.status(429).json({
        success: false,
        statusCode: 429,
        message: "Too many login attempts. Please try again after 15 minutes."
    });
}

});

export const registerLimiter = rateLimit({

    windowMs: 60 * 60 * 1000,

    max: 10,

    standardHeaders: true,

    legacyHeaders: false,

    handler: (req, res) => {
        res.status(429).json({
            success: false,
            statusCode: 429,
            message: "Too many registrations. Please try again later."
        });
    }

});

export const forgotPasswordLimiter = rateLimit({

    windowMs: 15 * 60 * 1000,

    max: 3,

    standardHeaders: true,

    legacyHeaders: false,

    handler: (req, res) => {
        res.status(429).json({
            success: false,
            statusCode: 429,
            message: "Too many password reset requests."
        });
    }

});

export const otpLimiter = rateLimit({

    windowMs: 10 * 60 * 1000,

    max: 3,

    standardHeaders: true,

    legacyHeaders: false,

    handler: (req, res) => {
        res.status(429).json({
            success: false,
            statusCode: 429,
            message: "Too many OTP requests."
        });
    }

});