import Internship from "../../internships/models/Internship.js";
import StudentInternship from "../../internships/models/StudentInternship.js";
import { readCourseData } from "../../submissions/utils/courseData.utils.js";

const getRecommendedInternships = async (userId) => {

    const [
        internships,
        enrolledInternships
    ] = await Promise.all([

        Internship.find({
            isPublished: true
        })
            .sort({
                createdAt: -1
            })
            .limit(6),

        StudentInternship.find({
            student: userId,

            // IMPORTANT:
            // Only fetch internship enrollments,
            // not course enrollments.
            internship: {
                $exists: true,
                $ne: null
            }
        }).select(
            "internship completedTasks progress status"
        )
    ]);

    const enrolledMap = new Map();

    enrolledInternships.forEach(item => {

        if (!item.internship) {
            return;
        }

        enrolledMap.set(
            item.internship.toString(),
            {
                completedTasks: item.completedTasks || 0,
                progress: item.progress || 0,
                status: item.status || "Not Started"
            }
        );
    });

    return Promise.all(internships.map(async item => {

        const enrolled = enrolledMap.get(
            item._id.toString()
        );

        const internshipData = await readCourseData(item.slug);
        const totalLessons = (internshipData?.modules || []).reduce(
            (count, module) => count + (module.lessons?.length || 0),
            0
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
            totalNotes: totalLessons,
            certificate: item.certificate,
            badge: item.badge,
            enrolled: !!enrolled,
            progress: enrolled?.progress || 0,
            completedTasks: enrolled?.completedTasks || 0,
            status: enrolled?.status || "Not Started"
        };
    }));
};

export default getRecommendedInternships;