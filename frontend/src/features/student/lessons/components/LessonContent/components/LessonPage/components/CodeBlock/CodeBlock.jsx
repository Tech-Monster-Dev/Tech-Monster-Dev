import { useState } from "react";

import "./CodeBlock.css";

import highlightCode from "../TryItYourself/utils/highlightCode.js";
import formatDisplayCode from "./formatDisplayCode.js";

export default function CodeBlock({
    code,
    language = "text",
    filename = "",
}) {
    const [copied, setCopied] = useState(false);

    if (!code) return null;

    const displayCode =
        formatDisplayCode(code, language);

    const highlightedCode =
        highlightCode(displayCode, language);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(code);

            setCopied(true);

            window.setTimeout(() => {
                setCopied(false);
            }, 1600);
        } catch {
            setCopied(false);
        }
    };

    return (
        <div className="lesson-codeblock">

            <div className="lesson-codeblock__header">

                <div className="lesson-codeblock__meta">

                    {filename ? (
                        <span className="lesson-codeblock__filename">
                            {filename}
                        </span>
                    ) : null}

                    <span className="lesson-codeblock__language">
                        {language}
                    </span>

                </div>

                <button
                    type="button"
                    className="lesson-codeblock__copy"
                    onClick={handleCopy}
                    aria-label="Copy code"
                >
                    {copied ? "Copied" : "Copy"}
                </button>

            </div>

            <pre className="lesson-codeblock__body">
                <code
                    dangerouslySetInnerHTML={{
                        __html:
                            highlightedCode ||
                            "&nbsp;",
                    }}
                />
            </pre>

        </div>
    );
}
