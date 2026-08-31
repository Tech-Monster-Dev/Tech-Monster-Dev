import "./NotePoint.css";

export default function NotePoint({
    points = [],
}) {
    if (
        !Array.isArray(points) ||
        points.length === 0
    ) {
        return null;
    }

    return (
        <div className="lesson-checklist">
            <div className="lesson-checklist__header">
                <span className="lesson-checklist__icon">
                    ✓
                </span>

                <span className="lesson-checklist__title">
                    Checklist
                </span>
            </div>

            <ul className="lesson-checklist__items">
                {points.map((point, index) => (
                    <li
                        key={`${String(point)}-${index}`}
                        className="lesson-checklist__item"
                    >
                        <span
                            className="lesson-checklist__check"
                            aria-hidden="true"
                        >
                            ✓
                        </span>

                        <span className="lesson-checklist__text">
                            {point}
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    );
}
