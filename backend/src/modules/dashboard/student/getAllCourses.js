import Course from "../../courses/models/Course.js";
import StudentInternship from "../../internships/models/StudentInternship.js";

const getAllCourses = async (userId) => {
    const [
        courses,
        enrolledCourses
    ] = await Promise.all([
        Course.find({
            isPublished: true
        }).sort({
            createdAt: -1
        }),

        StudentInternship.find({
            student: userId,
            course: { $ne: null }
        }).select(
            "course completedTasks progress status"
        )
    ]);

    const enrolledMap = new Map();
    enrolledCourses.forEach(item => {
        if (!item.course) return;
        enrolledMap.set(
            item.course.toString(),
            {
                completedTasks: item.completedTasks,
                progress: item.progress,
                status: item.status
            }
        );
    });

    return courses.map(item => {
        const enrolled = enrolledMap.get(
            item._id.toString()
        );

        return {
            _id: item._id,
            title: item.title,
            slug: item.slug,
            thumbnail: item.thumbnail,
            description: item.description,
            category: item.category,
            level: item.level,
            duration: item.duration,
            totalTasks: item.totalTasks,
            totalNotes: item.totalNotes,
            certificate: item.certificate,
            badge: item.badge,
            enrolled: !!enrolled,
            progress: enrolled?.progress || 0,
            completedTasks: enrolled?.completedTasks || 0,
            status: enrolled?.status || "Not Started"
        };
    });
};

export default getAllCourses;