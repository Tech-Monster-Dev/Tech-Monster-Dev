export default function TryItTrigger({ onClick }) {
    return (
        <button
            type="button"
            className="lesson-try-it__trigger"
            onClick={onClick}
        >
            <span
                className="lesson-try-it__trigger-icon"
                aria-hidden="true"
            >
                ▶
            </span>

            <span>Try It Yourself</span>
        </button>
    );
}
