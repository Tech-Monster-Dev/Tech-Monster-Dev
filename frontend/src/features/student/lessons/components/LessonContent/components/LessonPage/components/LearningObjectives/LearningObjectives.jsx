import "./LearningObjectives.css";

export default function LearningObjectives({
    objectives = [],
}) {
    if (
        !Array.isArray(objectives) ||
        objectives.length === 0
    ) {
        return null;
    }

    return (
        <section className="lesson-learning-objectives">
            <div className="lesson-learning-objectives__header">
                <span className="lesson-learning-objectives__eyebrow">
                    LEARNING OBJECTIVES
                </span>

                <h3 className="lesson-learning-objectives__title">
                    What You Will Learn
                </h3>
            </div>

            <div className="lesson-learning-objectives__list">
                {objectives.map((objective, index) => (
                    <div
                        className="lesson-learning-objectives__item"
                        key={`${String(objective)}-${index}`}
                    >
                        <span className="lesson-learning-objectives__number">
                            {index + 1}
                        </span>

                        <span className="lesson-learning-objectives__text">
                            {objective}
                        </span>
                    </div>
                ))}
            </div>
        </section>
    );
}
