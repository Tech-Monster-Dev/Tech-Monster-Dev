import { useRef } from "react";
import highlightCode from "../utils/highlightCode";

const PAIRS = {
    "(": ")",
    "[": "]",
    "{": "}",
    '"': '"',
    "'": "'",
    "`": "`",
};

const INDENT_SIZE = 4;

export default function CodeEditor({
    code,
    onChange,
    onRun,
    language,
    disabled = false,
}) {
    const textareaRef = useRef(null);
    const lineNumbersRef = useRef(null);
    const highlightRef = useRef(null);

    const lines = code.split("\n");

    const highlightedCode =
        highlightCode(code, language);

    const setCursor = (position) => {
        requestAnimationFrame(() => {
            if (!textareaRef.current) return;

            textareaRef.current.selectionStart =
                position;

            textareaRef.current.selectionEnd =
                position;
        });
    };

    const handleScroll = (event) => {
        const {
            scrollTop,
            scrollLeft,
        } = event.currentTarget;

        if (lineNumbersRef.current) {
            lineNumbersRef.current.scrollTop =
                scrollTop;
        }

        if (highlightRef.current) {
            highlightRef.current.scrollTop =
                scrollTop;

            highlightRef.current.scrollLeft =
                scrollLeft;
        }
    };

    const handleKeyDown = (event) => {
        const textarea = event.currentTarget;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;

        /* Ctrl/Cmd + Enter → Run */
        if (
            event.key === "Enter" &&
            (event.ctrlKey || event.metaKey)
        ) {
            event.preventDefault();

            if (!disabled && onRun) {
                onRun();
            }

            return;
        }

        /* Tab → 4 spaces */
        if (event.key === "Tab") {
            event.preventDefault();

            const nextCode =
                code.substring(0, start) +
                " ".repeat(INDENT_SIZE) +
                code.substring(end);

            onChange(nextCode);

            setCursor(
                start + INDENT_SIZE
            );

            return;
        }

        /* Enter → preserve indentation + handle auto-closed pairs */
        if (event.key === "Enter") {
            event.preventDefault();

            const lineStart =
                code.lastIndexOf(
                    "\n",
                    start - 1
                ) + 1;

            const currentLine =
                code.substring(
                    lineStart,
                    start
                );

            const indentation =
                currentLine.match(/^[ \t]*/)?.[0] ||
                "";

            const previousChar =
                code[start - 1] || "";

            const nextChar =
                code[start] || "";

            const isBetweenAutoClosedPair =
                PAIRS[previousChar] === nextChar;

            if (isBetweenAutoClosedPair) {
                const innerIndent =
                    indentation +
                    " ".repeat(INDENT_SIZE);

                const insertion =
                    "\n" +
                    innerIndent +
                    "\n" +
                    indentation;

                const nextCode =
                    code.substring(0, start) +
                    insertion +
                    code.substring(end);

                onChange(nextCode);

                setCursor(
                    start +
                    1 +
                    innerIndent.length
                );

                return;
            }

            const insertion =
                "\n" +
                indentation +
                (
                    previousChar === "{"
                        ? " ".repeat(INDENT_SIZE)
                        : ""
                );

            const nextCode =
                code.substring(0, start) +
                insertion +
                code.substring(end);

            onChange(nextCode);

            setCursor(
                start + insertion.length
            );

            return;
        }

        /* Auto close brackets / quotes */
        if (
            Object.prototype.hasOwnProperty.call(
                PAIRS,
                event.key
            )
        ) {
            event.preventDefault();

            const closing =
                PAIRS[event.key];

            const selected =
                code.substring(start, end);

            const nextCode =
                code.substring(0, start) +
                event.key +
                selected +
                closing +
                code.substring(end);

            onChange(nextCode);

            setCursor(
                start +
                    1 +
                    selected.length
            );
        }
    };

    return (
        <section className="lesson-terminal__editor">
            <div className="lesson-terminal__editor-label">
                <span className="lesson-terminal__editor-dot" />

                <span>Code</span>

                <span className="lesson-terminal__editor-language">
                    {language}
                </span>
            </div>

            <div className="lesson-terminal__editor-body">
                <div
                    ref={lineNumbersRef}
                    className="lesson-terminal__line-numbers"
                    aria-hidden="true"
                >
                    {lines.map((_, index) => (
                        <div
                            className="lesson-terminal__line-number"
                            key={index}
                        >
                            {index + 1}
                        </div>
                    ))}
                </div>

                <div className="lesson-terminal__code-wrapper">
                    <pre
                        ref={highlightRef}
                        className="lesson-terminal__highlight"
                        aria-hidden="true"
                        dangerouslySetInnerHTML={{
                            __html:
                                highlightedCode ||
                                "&nbsp;",
                        }}
                    />

                    <textarea
                        ref={textareaRef}
                        className="lesson-terminal__textarea"
                        value={code}
                        onChange={(event) =>
                            onChange(
                                event.target.value
                            )
                        }
                        onScroll={handleScroll}
                        onKeyDown={handleKeyDown}
                        disabled={disabled}
                        spellCheck={false}
                        autoCapitalize="off"
                        autoCorrect="off"
                        autoComplete="off"
                        wrap="off"
                        aria-label="Code editor"
                    />
                </div>
            </div>
        </section>
    );
}
