import StudentInternship from "../../internships/models/StudentInternship.js";

const getMyInternships = async (userId) => {

    const internships = await StudentInternship.find({
        student: userId,
        internship: {
            $exists: true,
            $ne: null
        }
    })
        .populate({
            path: "internship",
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

    return internships
        .filter(item => item.internship)
        .map(item => {

            const remainingTasks = Math.max(
                (item.internship.totalTasks || 0) -
                (item.completedTasks || 0),
                0
            );

            const remainingNotes = Math.max(
                (item.internship.totalNotes || 0) -
                (item.completedNotes || 0),
                0
            );

            return {
                _id: item._id,
                type: "internship",
                internshipId: item.internship._id,
                slug: item.internship.slug,
                title: item.internship.title,
                thumbnail: item.internship.thumbnail,
                category: item.internship.category,
                level: item.internship.level,
                duration: item.internship.duration,
                totalTasks: item.internship.totalTasks,
                totalNotes: item.internship.totalNotes,
                completedTasks: item.completedTasks || 0,
                remainingTasks,
                remainingNotes,
                progress: item.progress || 0,
                status: item.status || "Not Started",
                certificateEligible: item.internship.certificate,
                badgeEligible: item.internship.badge,
                certificateIssued: item.certificateIssued || false,
                startedAt: item.startedAt,
                completedAt: item.completedAt,
                enrolledAt: item.createdAt
            };
        });
};

export default getMyInternships;