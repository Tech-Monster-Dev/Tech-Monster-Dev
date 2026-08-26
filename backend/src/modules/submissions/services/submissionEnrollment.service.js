import Internship from "../../internships/models/Internship.js";
import StudentInternship from "../../internships/models/StudentInternship.js";
import Course from "../../courses/models/Course.js";

export const resolveEnrollment =
    async (
        studentId,
        courseSlug
    ) => {
        let internship = null;
        let course = null;

        try {
            internship =
                await Internship.findOne({
                    slug: courseSlug,
                });

            if (internship) {
                const enrollment =
                    await StudentInternship.findOne(
                        {
                            student:
                                studentId,

                            internship:
                                internship._id,
                        }
                    );

                if (
                    enrollment?.internship
                ) {
                    internship =
                        enrollment.internship;
                } else {
                    internship = null;
                }
            }
        } catch {
            internship = null;
        }

        if (!internship) {
            try {
                course =
                    await Course.findOne({
                        slug: courseSlug,
                    });

                if (course) {
                    const enrollment =
                        await StudentInternship.findOne(
                            {
                                student:
                                    studentId,

                                course:
                                    course._id,
                            }
                        );

                    if (
                        !enrollment?.course
                    ) {
                        course = null;
                    }
                }
            } catch {
                course = null;
            }
        }

        return {
            internship,
            course,
        };
    };