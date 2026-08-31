import "./List.css";

export default function Lists({
    items = [],
    title = "",
    ordered = false,
    tone = "",
}) {
    if (!Array.isArray(items) || items.length === 0) {
        return null;
    }

    const ListTag = ordered ? "ol" : "ul";

    const semanticConfig = {
        info: {
            icon: "i",
            label: "Core Ideas",
        },
        success: {
            icon: "✓",
            label: "Best Practices",
        },
        warning: {
            icon: "!",
            label: "Common Mistakes",
        },
    };

    const semantic = semanticConfig[tone] || null;

    return (
        <div
            className={`lesson-list-block ${
                ordered
                    ? "lesson-list-block--ordered"
                    : "lesson-list-block--unordered"
            } ${
                tone
                    ? `lesson-list-block--${tone}`
                    : ""
            }`}
        >
            {semantic ? (
                <div className="lesson-list-semantic-label">
                    <span
                        className="lesson-list-semantic-icon"
                        aria-hidden="true"
                    >
                        {semantic.icon}
                    </span>

                    <span>
                        {semantic.label}
                    </span>
                </div>
            ) : null}

            {title ? (
                <h4 className="lesson-list-title">
                    {title}
                </h4>
            ) : null}

            <ListTag className="lesson-list">
                {items.map((item, index) => (
                    <li
                        key={`${String(item)}-${index}`}
                        className="lesson-list-item"
                    >
                        {semantic ? (
                            <span
                                className="lesson-list-item__icon"
                                aria-hidden="true"
                            >
                                {semantic.icon}
                            </span>
                        ) : null}

                        <span className="lesson-list-item__text">
                            {item}
                        </span>
                    </li>
                ))}
            </ListTag>
        </div>
    );
}
