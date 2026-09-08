import * as prettier from "prettier/standalone";
import * as babelPlugin from "prettier/plugins/babel";
import * as cssPlugin from "prettier/plugins/postcss";
import * as estreePlugin from "prettier/plugins/estree";
import * as htmlPlugin from "prettier/plugins/html";
import * as typescriptPlugin from "prettier/plugins/typescript";
import * as yamlPlugin from "prettier/plugins/yaml";

const LANGUAGE_ALIASES = {
    js: "javascript",
    jsx: "javascript",
    javascript: "javascript",
    html: "markup",
    xml: "markup",
    css: "css",
    json: "json",
    python: "python",
    py: "python",
    bash: "bash",
    shell: "bash",
    sh: "bash",
    yaml: "yaml",
    yml: "yaml",
    kql: "kusto",
    ts: "typescript",
    tsx: "typescript",
    typescript: "typescript",
};

const PRETTIER_CONFIG = {
    markup: {
        parser: "html",
        plugins: [htmlPlugin],
    },
    css: {
        parser: "css",
        plugins: [cssPlugin],
    },
    javascript: {
        parser: "babel",
        plugins: [babelPlugin, estreePlugin],
    },
    json: {
        parser: "json",
        plugins: [babelPlugin, estreePlugin],
    },
    typescript: {
        parser: "typescript",
        plugins: [typescriptPlugin, estreePlugin],
    },
    yaml: {
        parser: "yaml",
        plugins: [yamlPlugin],
    },
};

export const normalizeCodeLanguage = (language = "") => {
    const normalized = String(language).trim().toLowerCase();
    return LANGUAGE_ALIASES[normalized] || normalized;
};

export const inferCodeLanguage = (code = "", language = "") => {
    const normalizedLanguage = normalizeCodeLanguage(language);

    if (normalizedLanguage && normalizedLanguage !== "text") {
        return normalizedLanguage;
    }

    const source = String(code || "").trim();

    if (/^<(!doctype|html|table|div|section|nav|figure|main|form|ul|ol|[a-z]+\b)/i.test(source)) {
        return "markup";
    }

    if (
        (source.startsWith("{") || source.startsWith("[")) &&
        /["'][^\n]+["']\s*:/.test(source)
    ) {
        return "json";
    }

    if (/^([.#]?[\w-]+\s*)\{[\s\S]*:[\s\S]*\}/.test(source)) {
        return "css";
    }

    if (/^(#!\/.*\b(?:ba)?sh|(?:echo|export|set -|sudo|chmod|curl|wget)\s)/.test(source)) {
        return "bash";
    }

    return "javascript";
};

export const formatCodeForDisplay = async (
    code = "",
    language = ""
) => {
    const source = String(code || "");
    const resolvedLanguage = inferCodeLanguage(source, language);

    if (source.includes("\n") || !PRETTIER_CONFIG[resolvedLanguage]) {
        return source;
    }

    try {
        return await prettier.format(
            source,
            PRETTIER_CONFIG[resolvedLanguage]
        );
    } catch {
        return source;
    }
};
