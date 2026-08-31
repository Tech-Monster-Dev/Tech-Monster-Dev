export default function formatDisplayCode(code, language = "text") {
    if (!code || typeof code !== "string") {
        return code || "";
    }

    if (language.toLowerCase() !== "javascript") {
        return code;
    }

    if (code.includes("\n")) {
        return code;
    }

    return code
        .replace(/;\s+(?=(?:const|let|var|if|for|while|return|console\.|[A-Za-z_$][\w$]*\.)\b)/g, ";\n")
        .replace(/\{\s*(?=[A-Za-z_$])/g, "{\n    ")
        .replace(/;\s*\}/g, ";\n}")
        .replace(/\n\s+/g, "\n    ")
        .trim();
}
