import "./LessonExamples.css";

const renderValue = (value) => {
    if (value === null || value === undefined) return "";
    if (typeof value === "string") return value;
    return JSON.stringify(value, null, 2);
};

export default function LessonExamples({ examples = [] }) {
    if (!Array.isArray(examples) || examples.length === 0) {
        return null;
    }

    return (
        <section className="lesson-examples">
            <div className="lesson-examples__header">
                <span className="lesson-examples__eyebrow">EXAMPLES</span>
                <h3 className="lesson-examples__title">Worked Examples</h3>
            </div>

            <div className="lesson-examples__list">
                {examples.map((example, index) => {
                    const entries =
                        example && typeof example === "object"
                            ? Object.entries(example)
                            : [["Example", example]];

                    return (
                        <article
                            className="lesson-examples__item"
                            key={`example-${index}`}
                        >
                            {entries.map(([label, value]) => (
                                <div
                                    className="lesson-examples__field"
                                    key={label}
                                >
                                    <strong>{label}</strong>
                                    <span>{renderValue(value)}</span>
                                </div>
                            ))}
                        </article>
                    );
                })}
            </div>
        </section>
    );
}
