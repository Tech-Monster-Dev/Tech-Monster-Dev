import TerminalHeader from "./TerminalHeader";
import CodeEditor from "./CodeEditor";
import TerminalOutput from "./TerminalOutput";
import TerminalFooter from "./TerminalFooter";
import ResizeHandles from "./ResizeHandles";

export default function Terminal({
    terminalRef,
    size,
    language,
    code,
    status,
    output,
    error,
    onCodeChange,
    onRun,
    onClose,
    onDragStart,
    onDragMove,
    onDragEnd,
    onResizeStart,
    onResizeEnd,
}) {
    return (
        <div
            ref={terminalRef}
            className="lesson-terminal"
            style={{
                width: `${size.width}px`,
                height: `${size.height}px`,
            }}
            onPointerMove={onDragMove}
            onPointerUp={(event) => {
                onDragEnd(event);
                onResizeEnd(event);
            }}
            onPointerCancel={(event) => {
                onDragEnd(event);
                onResizeEnd(event);
            }}
        >
            <ResizeHandles
                onResizeStart={onResizeStart}
            />

            <TerminalHeader
                language={language}
                status={status}
                onClose={onClose}
                onDragStart={onDragStart}
            />

            <CodeEditor
                code={code}
                language={language}
                onChange={onCodeChange}
                onRun={onRun}
                disabled={status === "running"}
            />

            <TerminalOutput
                output={output}
                error={error}
                status={status}
            />

            <TerminalFooter
                status={status}
                onRun={onRun}
            />
        </div>
    );
}
