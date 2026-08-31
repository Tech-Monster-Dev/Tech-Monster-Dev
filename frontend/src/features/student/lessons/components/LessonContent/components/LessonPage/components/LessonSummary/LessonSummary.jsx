import "./LessonSummary.css";

export default function LessonSummary({
    summary = [],
}) {
    if (!Array.isArray(summary) || summary.length === 0) {
        return null;
    }

    return (
        <section className="lesson-summary">
            <div className="lesson-summary__header">
                <span className="lesson-summary__eyebrow">
                    LESSON SUMMARY
                </span>

                <h3 className="lesson-summary__title">
                    Key Takeaways
                </h3>
            </div>

            <div className="lesson-summary__list">
                {summary.map((item, index) => (
                    <div
                        className="lesson-summary__item"
                        key={`${String(item)}-${index}`}
                    >
                        <span className="lesson-summary__marker">
                            ✓
                        </span>

                        <span className="lesson-summary__text">
                            {item}
                        </span>
                    </div>
                ))}
            </div>
        </section>
    );
}
