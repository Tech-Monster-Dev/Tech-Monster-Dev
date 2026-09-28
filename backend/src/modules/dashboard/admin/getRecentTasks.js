import Task from "../../tasks/models/Task.js";

const getRecentTasks = async () => {
    const tasks = await Task.find({
        status: "Submitted"
    })
        .populate(
            "assignedTo",
            "firstName lastName avatar"
        )
        .populate(
            "internship",
            "title"
        )
        .sort({
            submittedAt: -1
        })
        .limit(5);

    return tasks.map(task => ({
        _id: task._id,
        title: task.title,
        student: `${task.assignedTo.firstName} ${task.assignedTo.lastName}`,
        avatar: task.assignedTo.avatar,
        internship: task.internship?.title,
        submittedAt: task.submittedAt,
        status: task.status
    }));
};

export default getRecentTasks;