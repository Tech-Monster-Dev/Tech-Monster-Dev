import Prism from "prismjs";

import "prismjs/components/prism-javascript";
import "prismjs/components/prism-markup";
import "prismjs/components/prism-css";
import "prismjs/components/prism-python";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-json";
import "prismjs/components/prism-yaml";
import "prismjs/components/prism-kusto";

const LANGUAGE_ALIASES = {
    js: "javascript",
    jsx: "javascript",
    javascript: "javascript",
    html: "markup",
    xml: "markup",
    markup: "markup",
    css: "css",
    python: "python",
    py: "python",
    bash: "bash",
    shell: "bash",
    sh: "bash",
    json: "json",
    yaml: "yaml",
    yml: "yaml",
    kql: "kusto",
    kusto: "kusto",
    typescript: "typescript",
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
