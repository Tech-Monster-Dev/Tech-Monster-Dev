import {
    useRef,
    useState,
} from "react";

import { motion } from "framer-motion";
import {
    FiSend,
    FiCode,
} from "react-icons/fi";

import highlightCode from "../../../lessons/components/LessonContent/components/LessonPage/components/TryItYourself/utils/highlightCode.js";

import "./CodeSubmission.css";

export default function CodeSubmission({
    task,
    onSubmit,
    submitting = false,
    disabled = false,
    expired = false,
}) {
    const [code, setCode] = useState("");

    const textareaRef = useRef(null);
    const highlightRef = useRef(null);

    const language =
        task?.language ||
        task?.programmingLanguage ||
        "javascript";

    const highlightedCode =
        highlightCode(
            code || " ",
            language
        );

    const syncScroll = () => {
        const textarea =
            textareaRef.current;

        const highlight =
            highlightRef.current;

        if (!textarea || !highlight) {
            return;
        }

        highlight.scrollTop =
            textarea.scrollTop;

        highlight.scrollLeft =
            textarea.scrollLeft;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!code.trim()) {
            return;
        }

        onSubmit(
            task?.id,
            code
        );
    };

    return (
        <motion.form
            className="code-submission"
            onSubmit={handleSubmit}
            initial={{
                opacity: 0,
                y: 14,
            }}
            animate={{
                opacity: 1,
                y: 0,
            }}
            transition={{
                duration: 0.4,
            }}
        >
            <div className="code-submission-title">
                <FiCode />

                <h3>
                    Submit Your Code
                </h3>

                <span>
                    Write this task in your local VS Code, then paste it here.
                </span>
            </div>

            <div className="code-submission-editor-wrapper">
                <pre
                    ref={highlightRef}
                    className="code-submission-highlight"
                    aria-hidden="true"
                >
                    <code
                        dangerouslySetInnerHTML={{
                            __html:
                                highlightedCode ||
                                "&nbsp;",
                        }}
                    />
                </pre>

                <textarea
                    ref={textareaRef}
                    className="code-submission-editor"
                    value={code}
                    onChange={(e) =>
                        setCode(
                            e.target.value
                        )
                    }
                    onScroll={syncScroll}
                    placeholder={
                        "// Paste your solution code here...\nfunction solve() { }\n\n// Write clean, well-commented code."
                    }
                    rows={10}
                    spellCheck={false}
                    disabled={disabled}
                />
            </div>

            <p className="code-submission-guideline">
                {expired
                    ? "This deadline has expired. Contact support to request an extension."
                    : "Make sure your solution compiles and meets the objectives above before submitting."}
            </p>

            <motion.button
                type="submit"
                className="code-submission-btn"
                whileTap={{
                    scale: 0.97,
                }}
                disabled={
                    disabled ||
                    submitting ||
                    !code.trim()
                }
            >
                {submitting ? (
                    "Submitting..."
                ) : (
                    <>
                        <FiSend />
                        Submit for Approval
                    </>
                )}
            </motion.button>
        </motion.form>
    );
}
