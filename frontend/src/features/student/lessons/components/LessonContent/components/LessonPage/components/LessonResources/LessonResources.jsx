import "./LessonResources.css";

export default function LessonResources({
    resources = [],
}) {
    if (!Array.isArray(resources) || resources.length === 0) {
        return null;
    }

    return (
        <section className="lesson-resources">
            <div className="lesson-resources__header">
                <span className="lesson-resources__eyebrow">
                    RESOURCES
                </span>

                <h3 className="lesson-resources__title">
                    Continue Learning
                </h3>
            </div>

            <div className="lesson-resources__list">
                {resources.map((resource, index) => {
                    const title =
                        resource?.title ||
                        resource?.name ||
                        `Resource ${index + 1}`;

                    const url =
                        resource?.url ||
                        resource?.href ||
                        resource?.link ||
                        "";

                    return (
                        <a
                            key={`${title}-${index}`}
                            className="lesson-resources__item"
                            href={url || undefined}
                            target={url ? "_blank" : undefined}
                            rel={url ? "noopener noreferrer" : undefined}
                        >
                            <span className="lesson-resources__icon">
                                ↗
                            </span>

                            <span className="lesson-resources__content">
                                <span className="lesson-resources__name">
                                    {title}
                                </span>

                                {resource?.description ? (
                                    <span className="lesson-resources__description">
                                        {resource.description}
                                    </span>
                                ) : null}
                            </span>
                        </a>
                    );
                })}
            </div>
        </section>
    );
}
