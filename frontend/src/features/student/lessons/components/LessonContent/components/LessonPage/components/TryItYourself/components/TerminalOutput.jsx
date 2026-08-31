export default function TerminalOutput({ output, error, status }) {
    return (
        <section className="lesson-terminal__output">
            <div className="lesson-terminal__output-header">
                <span>Output</span>
                <span>{status === "running" ? "Executing..." : status}</span>
            </div>
            <pre className={`lesson-terminal__output-body ${error ? "is-error" : ""}`}>
                {status === "running" ? "Running your code..." : error || output || "Run your code to see the output here."}
            </pre>
        </section>
    );
}
