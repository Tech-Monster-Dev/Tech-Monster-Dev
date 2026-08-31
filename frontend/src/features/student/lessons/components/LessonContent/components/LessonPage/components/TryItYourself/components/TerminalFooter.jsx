export default function TerminalFooter({ status, onRun }) {
    const isRunning = status === "running";

    return (
        <footer className="lesson-terminal__footer">
            <span className="lesson-terminal__hint">
                Ctrl + Enter to run
            </span>

            <button
                type="button"
                className="lesson-terminal__run"
                onClick={onRun}
                disabled={isRunning}
            >
                <span aria-hidden="true">
                    {isRunning ? "◌" : "▶"}
                </span>
                {isRunning ? "Running..." : "Run Code"}
            </button>
        </footer>
    );
}
