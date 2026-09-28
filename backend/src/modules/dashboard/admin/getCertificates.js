import Certificate from "../../certificates/models/Certificate.js";

const getCertificates = async () => {
    // ==========================
    // Date Range
    // ==========================
    const now = new Date();
    const monthStart = new Date(
        now.getFullYear(),
        now.getMonth(),
        1
    );

    // ==========================
    // Analytics
    // ==========================
    const [
        totalCertificates,
        thisMonthCertificates,
        recentCertificates
    ] = await Promise.all([

        Certificate.countDocuments(),
        Certificate.countDocuments({
            issueDate: {
                $gte: monthStart
            }
        }),

        Certificate.find()
            .populate(
                "student",
                "firstName lastName avatar email"
            )
            .populate(
                "internship",
                "title category"
            )
            .sort({
                issueDate: -1
            })
            .limit(10)
    ]);

    return {
        totalCertificates,
        thisMonthCertificates,
        recentCertificates:
            recentCertificates.map(certificate => ({
                _id: certificate._id,
                certificateNumber: certificate.certificateNumber,
                issueDate: certificate.issueDate,
                pdfUrl: certificate.pdfUrl,
                student:
                    certificate.student
                        ? {
                            _id: certificate.student._id,
                            fullName: `${certificate.student.firstName} ${certificate.student.lastName}`,
                            email: certificate.student.email,
                            avatar: certificate.student.avatar
                        }
                        : null,
                internship: certificate.internship
                        ? {
                            _id: certificate.internship._id,
                            title: certificate.internship.title,
                            category: certificate.internship.category
                        }
                        : null
            }))
    };
};

export default getCertificates;