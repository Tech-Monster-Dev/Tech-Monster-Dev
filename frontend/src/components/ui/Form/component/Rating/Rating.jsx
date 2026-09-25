import { useState } from "react";
import "./Rating.css";

import {
    FaStar,
    FaRegStar,
    FaStarHalfAlt,
} from "react-icons/fa";

function Rating({
    rating = 0,
    max = 5,
    interactive = false,
    onChange,
    disabled = false,
    error = "",
    label,
}) {
    const [hovered, setHovered] = useState(0);

    const handleChange = (value) => {
        if (!interactive || disabled || !onChange) return;
        onChange(value);
    };

    const renderStar = (number, displayRating = rating) => {
        if (displayRating >= number) {
            return <FaStar className="star filled" />;
        }

        if (displayRating >= number - 0.5) {
            return <FaStarHalfAlt className="star half" />;
        }

        return <FaRegStar className="star empty" />;
    };

    return (
        <div className={`rating-wrapper${error ? " has-error" : ""}`}>
            {label && <span className="rating-label">{label}</span>}

            <div
                className={`rating${interactive ? " rating-interactive" : ""}`}
                role={interactive ? "radiogroup" : undefined}
                aria-label={interactive ? label || "Rating" : undefined}
            >
                {[...Array(max)].map((_, index) => {
                    const number = index + 1;
                    const displayRating = hovered || rating;

                    if (!interactive) {
                        return (
                            <span key={index}>
                                {renderStar(number)}
                            </span>
                        );
                    }

                    return (
                        <button
                            key={index}
                            type="button"
                            className="rating-star-button"
                            onClick={() => handleChange(number)}
                            onPointerDown={() => handleChange(number)}
                            onMouseEnter={() => setHovered(number)}
                            onMouseLeave={() => setHovered(0)}
                            disabled={disabled}
                            role="radio"
                            aria-checked={rating === number}
                            aria-label={`${number} star${number > 1 ? "s" : ""}`}
                        >
                            {renderStar(number, displayRating)}
                        </button>
                    );
                })}
            </div>

            {error && <small className="rating-error">{error}</small>}
        </div>
    );
}

export default Rating;
