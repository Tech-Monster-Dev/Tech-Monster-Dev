import { useNavigate } from "react-router-dom";
import {
    FiEdit2,
    FiTrash2,
    FiClock,
    FiBookOpen,
    FiCheckSquare,
    FiEye
} from "react-icons/fi";

import useScrollAnimation from "../../../../../shared/hooks/useScrollAnimation";
import "./InternshipCard.css";
import defaultThumbnail from "../../../../../assets/thumnail/course_internship_default.svg";

function SingleInternshipCard({
    item,
    onDelete
}) {
    const navigate = useNavigate();
    const {
        ref,
        className
    } = useScrollAnimation();

    // Image URL Handling (Uploaded relative path support)
    const getImageUrl = (image) => {
        if (!image) return defaultThumbnail;
        if (image.startsWith("http") || image.startsWith("data:") || image.startsWith("blob:")) {
            return image;
        }
        const apiUrl = import.meta.env.VITE_API_URL;

        return `${apiUrl}/${image.replace(/^\/+/, "")}`;
    };

    const imageSrc = getImageUrl(item.img || item.thumbnail);

    return (
        <div
            ref={ref}
            className={`
                allInternshipsCard
                ${className}
            `}
        >
            <div className="cardImage">
                <img
                    src={imageSrc}
                    onError={(event) => {
                        event.currentTarget.onerror = null;
                        event.currentTarget.src = defaultThumbnail;
                    }}
                    alt={item.title}
                />

                {/* Category Badge */}
                {item.category && (
                    <span className="cardCategoryBadge">
                        {item.category}
                    </span>
                )}

                <div className="cardActions">
                    <button
                        title="View Lessons"
                        onClick={() =>
                            navigate(`/student/lessons/${item.slug || item._id || "frontend-dev"}`)
                        }
                    >
                        <FiEye />
                    </button>

                    <button
                        title="Edit"
                        onClick={() =>
                            navigate(
                                "/admin/internships-form",
                                {
                                    state: {
                                        internshipData: item
                                    }
                                }
                            )
                        }
                    >
                        <FiEdit2 />
                    </button>

                    <button
                        title="Delete"
                        onClick={() =>
                            onDelete(item._id || item.id)
                        }
                    >
                        <FiTrash2 />
                    </button>
                </div>
            </div>

            <h3>
                {item.title}
            </h3>

            <p>
                {item.description}
            </p>

            {/* Form Fields Meta Grid */}
            <div className="meta">
                <span>
                    Level: {item.level || 'N/A'}
                </span>

                <span>
                    Certificate Fee: ₹{item.price ?? 0}
                </span>

                {item.duration && (
                    <span>
                        <FiClock style={{ marginRight: '4px' }} />
                        {item.duration}
                    </span>
                )}

                <span>
                    <FiBookOpen style={{ marginRight: '4px' }} />
                    Notes: {item.totalNotes || 0}
                </span>

                <span>
                    <FiCheckSquare style={{ marginRight: '4px' }} />
                    Tasks: {item.totalTasks || 0}
                </span>
            </div>
        </div>
    );
}

export default function InternshipCard({
    internships,
    onDelete
}) {

    return (
        <>
            {
                internships.map(item => (
                    <SingleInternshipCard
                        key={item._id || item.id}
                        item={item}
                        onDelete={onDelete}
                    />
                ))
            }
        </>
    );
}
