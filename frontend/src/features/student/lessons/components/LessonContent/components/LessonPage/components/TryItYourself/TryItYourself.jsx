import { useEffect, useRef, useState } from "react";
import "./TryItYourself.css";

import TryItTrigger from "./components/TryItTrigger";
import Terminal from "./components/Terminal";

import useCodeExecution from "./hooks/useCodeExecution";
import useTerminalDrag from "./hooks/useTerminalDrag";
import useTerminalResize from "./hooks/useTerminalResize";

const DEFAULT_WIDTH = 820;
const DEFAULT_HEIGHT = 520;
const VIEWPORT_GAP = 16;
const MIN_WIDTH = 420;
const MIN_HEIGHT = 300;

export default function TryItYourself({
    language = "text",
    starterCode = "",
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [code, setCode] = useState(starterCode);

    const [terminalSize, setTerminalSize] = useState({
        width: DEFAULT_WIDTH,
        height: DEFAULT_HEIGHT,
    });

    const terminalRef = useRef(null);

    const execution = useCodeExecution({
        language,
        code,
    });

    const drag = useTerminalDrag(terminalRef);

    const resize = useTerminalResize(
        terminalRef,
        setTerminalSize
    );

    useEffect(() => {
        setCode(starterCode || "");
    }, [starterCode]);

    const openTerminal = () => {
        setIsOpen(true);

        requestAnimationFrame(() => {
            const terminal = terminalRef.current;

            if (!terminal) return;

            const width = Math.min(
                DEFAULT_WIDTH,
                window.innerWidth -
                    VIEWPORT_GAP * 2
            );

            const height = Math.min(
                DEFAULT_HEIGHT,
                window.innerHeight -
                    VIEWPORT_GAP * 2
            );

            setTerminalSize({
                width: Math.max(
                    MIN_WIDTH,
                    width
                ),
                height: Math.max(
                    MIN_HEIGHT,
                    height
                ),
            });

            terminal.style.left = "50%";
            terminal.style.top = "50%";
            terminal.style.transform =
                "translate(-50%, -50%)";
        });
    };

    const closeTerminal = () => {
        setIsOpen(false);
        execution.reset();
    };

    return (
        <div className="lesson-try-it">
            {!isOpen && (
                <TryItTrigger
                    onClick={openTerminal}
                />
            )}

            {isOpen && (
                <Terminal
                    terminalRef={terminalRef}
                    size={terminalSize}
                    language={language}
                    code={code}
                    status={execution.status}
                    output={execution.output}
                    error={execution.error}
                    onCodeChange={setCode}
                    onRun={execution.run}
                    onClose={closeTerminal}
                    onDragStart={drag.start}
                    onDragMove={drag.move}
                    onDragEnd={drag.end}
                    onResizeStart={resize.start}
                    onResizeMove={resize.move}
                    onResizeEnd={resize.end}
                />
            )}
        </div>
    );
}
