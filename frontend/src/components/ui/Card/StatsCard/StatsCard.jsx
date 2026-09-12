import "./StatsCard.css";

function StatsCard({
    count = null,
    title,
    icon = null,
    description = "",
    className = "",
    titleClass = "",
    hover = true,
    descriptionClass = ""
}) {
    return (
        <div
            className={`stats-card ${hover ? "stats-card-hover" : ""} ${className}`}
        >
            {icon && (
                <div className="stats-card-icon">
                    {icon}
                </div>
            )}

            <div className="stats-card-content">
                {count !== null && (
                    <h2 className="stats-card-count">
                        {count}
                    </h2>
                )}

                <p className={`stats-card-title ${titleClass ? titleClass : ""}`}>
                    {title}
                </p>

                {description && (
                    <p className={`stats-card-description ${descriptionClass ? descriptionClass : ""}`}>
                        {description}
                    </p>
                )}
            </div>
        </div>
    );
}

export default StatsCard;