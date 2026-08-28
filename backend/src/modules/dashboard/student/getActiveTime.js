import AttendanceActivity from "../../attendance/models/AttendanceActivity.js";

const getActiveTime = async (userId) => {

    const activities = await AttendanceActivity.find({
        student: userId
    })
        .select("date activeSeconds")
        .sort({
            date: 1
        });

    return activities.map(item => ({
        date: item.date,
        activeSeconds: item.activeSeconds || 0
    }));

};

export default getActiveTime;
