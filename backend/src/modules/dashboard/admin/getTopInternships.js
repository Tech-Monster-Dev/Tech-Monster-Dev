import StudentInternship from "../../internships/models/StudentInternship.js";

const getTopInternships = async () => {
    const topInternships = await StudentInternship.aggregate([
        {
            $group: {
                _id: "$internship",
                totalStudents: {
                    $sum: 1
                },

                averageProgress: {
                    $avg: "$progress"
                },

                completedStudents: {
                    $sum: {
                        $cond: [
                            {
                                $eq: [
                                    "$status",
                                    "Completed"
                                ]
                            },
                            1,
                            0
                        ]
                    }
                }
            }
        },

        {
            $lookup: {
                from: "internships",
                localField: "_id",
                foreignField: "_id",
                as: "internship"
            }
        },

        {
            $unwind: "$internship"
        },

        {
            $project: {
                _id: "$internship._id",
                title: "$internship.title",
                thumbnail: "$internship.thumbnail",
                category: "$internship.category",
                level: "$internship.level",
                duration: "$internship.duration",
                totalTasks: "$internship.totalTasks",
                totalNotes: "$internship.totalNotes",
                isPublished: "$internship.isPublished",
                totalStudents: 1,
                averageProgress: {
                    $round: [
                        "$averageProgress",
                        0
                    ]
                },
                completedStudents: 1
            }
        },

        {
            $sort: {
                totalStudents: -1
            }
        },

        {
            $limit: 6
        }
    ]);

    return topInternships;
};

export default getTopInternships;