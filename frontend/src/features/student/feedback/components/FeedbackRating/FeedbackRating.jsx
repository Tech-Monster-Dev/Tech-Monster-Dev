import { useState } from "react";
import { FaRegStar, FaStar } from "react-icons/fa";
import "./FeedbackRating.css";

export default function FeedbackRating({ value, onChange, error }) {
    const [hovered, setHovered] = useState(0);

    return (
        <div className="feedback-rating-field">
            <div className="feedback-rating-label">
                <span>Rating</span>
                <span className="feedback-rating-required">*</span>
            </div>

            <div
                className="feedback-rating-input"
                role="radiogroup"
                aria-label="Select a rating from 1 to 5 stars"
            >
                {[1, 2, 3, 4, 5].map((star) => {
                    const active = star <= (hovered || value);

                    return (
                        <button
                            key={star}
                            type="button"
                            className={
                                "feedback-rating-star " +
                                (active ? "active" : "")
                            }
                            onClick={() => onChange(star)}
                            onMouseEnter={() => setHovered(star)}
                            onMouseLeave={() => setHovered(0)}
                            role="radio"
                            aria-checked={value === star}
                            aria-label={
                                star +
                                " star" +
                                (star > 1 ? "s" : "")
                            }
                        >
                            {active ? <FaStar /> : <FaRegStar />}
                        </button>
                    );
                })}
            </div>

            <span className="feedback-rating-value">
                {value ? value + "/5" : "Select your rating"}
            </span>

            {error && (
                <small className="feedback-field-error">
                    {error}
                </small>
            )}
        </div>
    );
}
