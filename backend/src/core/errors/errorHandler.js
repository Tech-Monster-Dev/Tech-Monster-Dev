import mongoose from "mongoose";
import logger from "../../infrastructure/logging/logger.js";

const errorHandler = (
    err,
    req,
    res,
    next
) => {

    // ==========================================================
    // Default Error
    // ==========================================================
    let statusCode = err.statusCode || 500;
    let message = err.message || "Internal Server Error";

    // ==========================================================
    // Mongoose Invalid ObjectId
    // ==========================================================
    if (
        err instanceof mongoose.Error.CastError
    ) {
        statusCode = 400;
        message = `Invalid ${err.path}`;
    }

    // ==========================================================
    // Mongoose Validation Error
    // ==========================================================
    if (
        err instanceof mongoose.Error.ValidationError
    ) {
        statusCode = 400;
        message = Object.values(
            err.errors
        )
            .map(
                item => item.message
            )
            .join(", ");
    }

    // ==========================================================
    // Duplicate Key Error
    // ==========================================================
    if (
        err.code === 11000
    ) {
        statusCode = 409;
        const field = Object.keys(
            err.keyValue
        )[0];
        message = `${field} already exists`;
    }

    // ==========================================================
    // JWT Invalid
    // ==========================================================
    if (
        err.name === "JsonWebTokenError"
    ) {
        statusCode = 401;
        message = "Invalid token";
    }

    // ==========================================================
    // JWT Expired
    // ==========================================================
    if (
        err.name === "TokenExpiredError"
    ) {
        statusCode = 401;
        message = "Token expired";
    }

    // ==========================================================
    // Multer Error
    // ==========================================================
    if (
        err.name === "MulterError"
    ) {
        statusCode = 400;
        message = err.message;
    }

    // ==========================================================
    // Cloudinary Error
    // ==========================================================
    if (
        err.http_code
    ) {
        statusCode = err.http_code;
        message = err.message;
    }

    // ==========================================================
    // Logger
    // ==========================================================
    logger.error(
        `[${req.method}] ${req.originalUrl}`,
        {
            message,
            stack: err.stack
        }
    );

    // ==========================================================
    // Development Response
    // ==========================================================
    if (
        process.env.NODE_ENV === "development"
    ) {
        return res.status(statusCode).json({
            success: false,
            statusCode,
            message,
            stack: err.stack,
            error: err
        });
    }

    // ==========================================================
    // Production Response
    // ==========================================================
    return res.status(statusCode).json({
        success: false,
        statusCode,
        message
    });
};

export default errorHandler;