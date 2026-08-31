import Prism from "prismjs";

import "prismjs/components/prism-javascript";
import "prismjs/components/prism-markup";
import "prismjs/components/prism-css";
import "prismjs/components/prism-python";

const LANGUAGE_ALIASES = {
    js: "javascript",
    jsx: "javascript",
    javascript: "javascript",
    html: "markup",
    xml: "markup",
    css: "css",
    python: "python",
    py: "python",
};

export default function highlightCode(
    code = "",
    language = "text"
) {
    const normalized =
        LANGUAGE_ALIASES[
            String(language).toLowerCase()
        ];

    if (!normalized || !Prism.languages[normalized]) {
        return escapeHtml(code);
    }

    return Prism.highlight(
        code,
        Prism.languages[normalized],
        normalized
    );
}

function escapeHtml(value) {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}
