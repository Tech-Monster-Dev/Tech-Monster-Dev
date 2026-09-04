import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

import "./LearningCard.css";

const LearningCard = ({
    item,
    internship,
    type = "course",
    index = 0,
    title,
    badge,
    hint = "Tap to continue",
    detailsPath,
    onClick,
    className = "",
}) => {
    const navigate = useNavigate();

    const data = item || internship;
    const cardTitle = title || data?.title || "Untitled";
    const cardBadge = badge || (data?.enrolled ? "Enrolled" : "New");

    const handleClick = () => {
        if (typeof onClick === "function") {
            onClick(data, type);
            return;
        }

        const path =
            detailsPath ||
            (data?.slug
                ? `/student/learning/${type}/${data.slug}`
                : null);

        if (path) {
            navigate(path);
        }
    };

    const handleKeyDown = (event) => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            handleClick();
        }
    };

    return (
        <motion.article
            className={`learning-card ${className}`.trim()}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: index * 0.06 }}
            whileHover={{ y: -4 }}
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            role="link"
            tabIndex={0}
        >
            <span className="learning-card-badge">
                {cardBadge}
            </span>

            <div className="learning-card-content">
                <h3>{cardTitle}</h3>
                <p>{hint}</p>
            </div>

            <span
                className="learning-card-arrow"
                aria-hidden="true"
            >
                <ArrowRight size={20} />
            </span>
        </motion.article>
    );
};

export default LearningCard;
