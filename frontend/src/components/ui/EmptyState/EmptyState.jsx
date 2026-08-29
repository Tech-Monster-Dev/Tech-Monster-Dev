import "./EmptyState.css";

function EmptyState({
    heading = "Nothing here yet",
    paragraph = "There is no content available to display right now.",
    fullPage = false,
    compact = false
}) {
    return (
        <div
            className={`empty-state ${fullPage ? "empty-state--full-page" : compact ? "empty-state--compact" : "empty-state--section"}`}
            role="status"
            aria-live="polite"
        >
            <div className="empty-state__content">
                <div className="empty-state__icon" aria-hidden="true">
                    <span />
                </div>

                <h2>{heading}</h2>

                <p>{paragraph}</p>
            </div>
        </div>
    );
}

export default EmptyState;
