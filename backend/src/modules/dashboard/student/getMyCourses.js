import StudentInternship from "../../internships/models/StudentInternship.js";

const getMyCourses = async (userId) => {

    const courses = await StudentInternship.find({
        student: userId,
        course: {
            $exists: true,
            $ne: null
        }
    })
        .populate({
            path: "course",
            select: `
                title
                slug
                thumbnail
                category
                level
                duration
                totalTasks
                totalNotes
                certificate
                badge
            `
        })
        .sort({
            createdAt: -1
        });

    return courses
        .filter(item => item.course)
        .map(item => {

            const completedTasks = item.completedTasks || 0;
            const completedNotes = item.completedNotes || 0;

            const remainingTasks = Math.max(
                (item.course.totalTasks || 0) - completedTasks,
                0
            );

            const remainingNotes = Math.max(
                (item.course.totalNotes || 0) - completedNotes,
                0
            );

            return {
                _id: item._id,
                type: "course",
                courseId: item.course._id,
                slug: item.course.slug,
                title: item.course.title,
                thumbnail: item.course.thumbnail,
                category: item.course.category,
                level: item.course.level,
                duration: item.course.duration,
                totalTasks: item.course.totalTasks || 0,
                totalNotes: item.course.totalNotes || 0,
                completedTasks,
                completedNotes,
                remainingTasks,
                remainingNotes,
                progress: item.progress || 0,
                status: item.status || "Not Started",
                certificateEligible: item.course.certificate || false,
                badgeEligible: item.course.badge || false,
                certificateIssued: item.certificateIssued || false,
                startedAt: item.startedAt,
                completedAt: item.completedAt,
                enrolledAt: item.createdAt
            };
        });
};

export default getMyCourses;