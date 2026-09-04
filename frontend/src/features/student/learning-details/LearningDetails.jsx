import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, BookOpen, Clock3, ListChecks } from "lucide-react";
import { toast } from "react-toastify";

import Spinner from "../../dashboard/common/LoaderPage/Spinner/Spinner";
import { getCourseBySlug } from "../../../services/api/course.service";
import { getInternshipBySlug } from "../../../services/api/internship.service";

import "./LearningDetails.css";

export default function LearningDetails() {
    const { type, slug } = useParams();
    const navigate = useNavigate();

    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(true);

    const isInternship = type === "internship";
    const label = isInternship ? "Internship" : "Course";

    useEffect(() => {
        const loadDetails = async () => {
            if (!slug) {
                toast.error(`${label} not found.`);
                navigate("/student/dashboard", { replace: true });
                return;
            }

            try {
                setLoading(true);

                const response = isInternship
                    ? await getInternshipBySlug(slug)
                    : await getCourseBySlug(slug);

                const data = isInternship
                    ? response?.data?.internship
                    : response?.data?.course;

                if (!data) {
                    throw new Error(`${label} not found.`);
                }

                setItem(data);
            } catch (error) {
                console.error(`Failed to load ${label.toLowerCase()} details:`, error);

                toast.error(
                    error?.response?.data?.message ||
                    `Unable to load ${label.toLowerCase()} details.`
                );

                navigate("/student/dashboard", { replace: true });
            } finally {
                setLoading(false);
            }
        };

        loadDetails();
    }, [slug, isInternship, label, navigate]);

    if (loading) {
        return (
            <Spinner
                message={`Loading ${label.toLowerCase()} details...`}
                size={60}
            />
        );
    }

    if (!item) {
        return null;
    }

    return (
        <div className="learning-details-page">
            <button
                type="button"
                className="learning-details-back"
                onClick={() => navigate(-1)}
            >
                <ArrowLeft size={18} />
                <span>Back</span>
            </button>

            <header className="learning-details-header">
                <span className="learning-details-type">
                    {label}
                </span>

                <h1>{item.title || label}</h1>

                {item.category && (
                    <p className="learning-details-category">
                        {item.category}
                    </p>
                )}

                {item.description && (
                    <p className="learning-details-description">
                        {item.description}
                    </p>
                )}
            </header>

            <div className="learning-details-meta">
                {item.level && (
                    <div className="learning-details-meta-item">
                        <BookOpen size={18} />
                        <span>{item.level}</span>
                    </div>
                )}

                {item.duration && (
                    <div className="learning-details-meta-item">
                        <Clock3 size={18} />
                        <span>{item.duration}</span>
                    </div>
                )}

                {item.totalTasks !== undefined && (
                    <div className="learning-details-meta-item">
                        <ListChecks size={18} />
                        <span>{item.totalTasks} Tasks</span>
                    </div>
                )}
            </div>

            <section className="learning-details-content">
                <div className="learning-details-section-heading">
                    <h2>What you will learn</h2>
                    <span>
                        {Array.isArray(item.modules)
                            ? item.modules.length
                            : 0}{" "}
                        Modules
                    </span>
                </div>

                {Array.isArray(item.modules) && item.modules.length > 0 ? (
                    <div className="learning-details-modules">
                        {item.modules.map((module, index) => (
                            <article
                                className="learning-details-module"
                                key={module._id || module.id || index}
                            >
                                <span className="learning-details-module-number">
                                    {String(index + 1).padStart(2, "0")}
                                </span>

                                <div>
                                    <h3>
                                        {module.title ||
                                            module.name ||
                                            `Module ${index + 1}`}
                                    </h3>

                                    {module.description && (
                                        <p>{module.description}</p>
                                    )}
                                </div>
                            </article>
                        ))}
                    </div>
                ) : (
                    <p className="learning-details-empty">
                        Module information is not available yet.
                    </p>
                )}
            </section>

            <div className="learning-details-action">
                <button
                    type="button"
                    onClick={() =>
                        navigate(`/student/lessons/${type}/${item.slug}`)
                    }
                >
                    {item.enrolled ? "Continue Learning" : "View Learning"}
                </button>
            </div>
        </div>
    );
}
