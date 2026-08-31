import "./LessonCallout.css";

export default function LessonCallout({
    type = "tip",
    title = "",
    text = "",
}) {
    if (!text) return null;

    const isWarning = type === "warning";

    return (
        <aside
            className={`lesson-callout ${
                isWarning
                    ? "lesson-callout--warning"
                    : "lesson-callout--tip"
            }`}
        >
            <div className="lesson-callout__icon" aria-hidden="true">
                {isWarning ? "!" : "i"}
            </div>

            <div className="lesson-callout__content">
                {title ? (
                    <h4 className="lesson-callout__title">
                        {title}
                    </h4>
                ) : null}

                <p className="lesson-callout__text">
                    {text}
                </p>
            </div>
        </aside>
    );
}
