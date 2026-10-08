import ActivityLog from "./models/ActivityLog.js";

const logActivity = async (
    req,
    userId,
    action,
    module,
    description
) => {

    try {
        await ActivityLog.create({
            user: userId,
            action,
            module,
            description,
            ipAddress: req.ip,
            userAgent: req.headers["user-agent"]
        });

    } catch (error) {
        console.log("Activity Log Error:", error.message);
    }
};

export default logActivity;