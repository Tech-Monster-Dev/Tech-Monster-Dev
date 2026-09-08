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
                    const normalizedResource =
                        typeof resource === "string"
                            ? { title: resource, url: resource }
                            : resource;

                    const title =
                        normalizedResource?.title ||
                        normalizedResource?.name ||
                        `Resource ${index + 1}`;

                    const url =
                        normalizedResource?.url ||
                        normalizedResource?.href ||
                        normalizedResource?.link ||
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

                                {normalizedResource?.description ? (
                                    <span className="lesson-resources__description">
                                        {normalizedResource.description}
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
