export default function TerminalHeader({
    language,
    status,
    onClose,
    onDragStart,
}) {
    const isRunning = status === "running";

    return (
        <header
            className="lesson-terminal__header"
            onPointerDown={onDragStart}
        >
            <div className="lesson-terminal__traffic">
                <span />
                <span />
                <span />
            </div>

            <div className="lesson-terminal__title">
                <span className="lesson-terminal__title-icon">
                    &gt;_
                </span>

                <span>Try It Yourself</span>
            </div>

            <div className="lesson-terminal__meta">
                <span className="lesson-terminal__language">
                    {language}
                </span>

                <span
                    className={`lesson-terminal__status ${
                        isRunning
                            ? "is-running"
                            : ""
                    }`}
                >
                    <span className="lesson-terminal__status-dot" />
                    {isRunning
                        ? "Running"
                        : "Ready"}
                </span>

                <button
                    type="button"
                    className="lesson-terminal__close"
                    onClick={onClose}
                    aria-label="Close terminal"
                >
                    ×
                </button>
            </div>
        </header>
    );
}
