import asyncHandler from "../../core/http/asyncHandler.js";
import { executeStudentCode } from "./services/codeExecution.service.js";

export const executeCode = asyncHandler(async (req, res) => {
    const {
        language,
        code,
    } = req.body;

    const result = await executeStudentCode({
        language,
        code,
    });

    const statusCode =
        result.status === "success"
            ? 200
            : result.status === "timeout"
                ? 408
                : 400;

    return res.status(statusCode).json({
        success: result.status === "success",
        data: result,
    });
});
