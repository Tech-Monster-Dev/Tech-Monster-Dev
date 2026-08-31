import { useState } from "react";
import { motion } from "framer-motion";
import {
    FiCheckCircle,
    FiCode,
    FiCopy,
} from "react-icons/fi";

import highlightCode from "../../../lessons/components/LessonContent/components/LessonPage/components/TryItYourself/utils/highlightCode.js";

import "./TaskSolution.css";

export default function TaskSolution({
    solutionCode = "",
    solutionExplanation = "",
    language = "javascript",
}) {
    const [copied, setCopied] = useState(false);

    if (!solutionCode && !solutionExplanation) {
        return null;
    }

    const highlightedCode = highlightCode(
        solutionCode,
        language
    );

    const handleCopy = async () => {
        if (!solutionCode) {
            return;
        }

        let copiedSuccessfully = false;

        try {
            if (
                navigator.clipboard &&
                typeof navigator.clipboard.writeText ===
                    "function"
            ) {
                await navigator.clipboard.writeText(
                    solutionCode
                );

                copiedSuccessfully = true;
            }
        } catch {
            copiedSuccessfully = false;
        }

        if (!copiedSuccessfully) {
            try {
                const textarea =
                    document.createElement("textarea");

                textarea.value = solutionCode;

                textarea.setAttribute(
                    "readonly",
                    ""
                );

                textarea.style.position =
                    "fixed";
                textarea.style.opacity = "0";
                textarea.style.pointerEvents =
                    "none";

                document.body.appendChild(
                    textarea
                );

                textarea.focus();
                textarea.select();
                textarea.setSelectionRange(
                    0,
                    textarea.value.length
                );

                copiedSuccessfully =
                    document.execCommand(
                        "copy"
                    );

                document.body.removeChild(
                    textarea
                );
            } catch {
                copiedSuccessfully = false;
            }
        }

        if (!copiedSuccessfully) {
            return;
        }

        setCopied(true);

        window.setTimeout(() => {
            setCopied(false);
        }, 1600);
    };

    return (
        <motion.div
            className="task-solution"
            initial={{
                opacity: 0,
                y: 12,
            }}
            animate={{
                opacity: 1,
                y: 0,
            }}
            transition={{
                duration: 0.3,
            }}
        >
            <div className="task-solution-header">
                <div className="task-solution-title">
                    <span className="task-solution-icon">
                        <FiCheckCircle />
                    </span>

                    <div>
                        <h3>
                            Solution
                        </h3>

                        <p>
                            Reference implementation for this task
                        </p>
                    </div>
                </div>
            </div>

            {solutionExplanation && (
                <div className="task-solution-explanation">
                    <div className="task-solution-section-title">
                        <FiCode />

                        <h4>
                            How the Solution Works
                        </h4>
                    </div>

                    <p>
                        {solutionExplanation}
                    </p>
                </div>
            )}

            {solutionCode && (
                <div className="task-solution-code">
                    <div className="task-solution-code-header">
                        <div>
                            <span>
                                Solution Code
                            </span>

                            <small>
                                {language}
                            </small>
                        </div>

                        <button
                            type="button"
                            onClick={handleCopy}
                            className="task-solution-copy"
                            aria-label="Copy solution code"
                        >
                            <FiCopy />

                            {copied
                                ? "Copied"
                                : "Copy Code"}
                        </button>
                    </div>

                    <pre className="task-solution-code-body">
                        <code
                            dangerouslySetInnerHTML={{
                                __html:
                                    highlightedCode ||
                                    "&nbsp;",
                            }}
                        />
                    </pre>
                </div>
            )}
        </motion.div>
    );
}
