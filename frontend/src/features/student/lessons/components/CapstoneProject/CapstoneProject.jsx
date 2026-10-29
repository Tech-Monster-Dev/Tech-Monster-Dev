import "./CapstoneProject.css";
import highlightCode from "../LessonContent/components/LessonPage/components/CodeBlock/utils/highlightCode.js";

const LABELS = {
    problemStatement: "Problem Statement",
    objectives: "Learning Objectives",
    requirements: "Requirements",
    features: "Required Features",
    architecture: "Architecture",
    projectStructure: "Project Structure",
    setupInstructions: "Setup Instructions",
    implementationSteps: "Implementation Steps",
    fileWiseSolution: "File-wise Solution",
    howItWorks: "How It Works",
    dataFlow: "Data Flow",
    testing: "Testing Strategy",
    securityReview: "Security Review",
    performanceReview: "Performance Review",
    troubleshooting: "Troubleshooting",
};

const formatLabel = (value) =>
    String(value)
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        .replace(/[_-]+/g, " ")
        .replace(/\b\w/g, (letter) => letter.toUpperCase());

function ProjectValue({ value }) {
    if (value == null || value === "") return null;

    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
        const text = String(value);
        const looksLikeCode =
            text.includes("\n") &&
            (text.includes("def ") ||
                text.includes("class ") ||
                text.includes("import ") ||
                text.includes("urlpatterns") ||
                text.includes("INSTALLED_APPS") || /[├└]──/.test(text));

        if (looksLikeCode) {
            const language =
                /(^|\n)\s*(def |class |from |import |if __name__|urlpatterns|INSTALLED_APPS)/.test(text)
                    ? "python"
                    : /[{}]\s*\n|=>|\bconst\s|\blet\s|\bfunction\s/.test(text)
                        ? "javascript"
                        : "text";

            return (
                <pre className="capstone-code">
                    <code dangerouslySetInnerHTML={{ __html: highlightCode(text, language) }} />
                </pre>
            );
        }

        return <p className="capstone-text">{text}</p>;
    }

    if (Array.isArray(value)) {
        if (!value.length) return <p className="capstone-muted">No items provided.</p>;

        return (
            <ul className="capstone-list">
                {value.map((item, index) => (
                    <li key={index}>
                        {typeof item === "object" && item !== null
                            ? <ProjectValue value={item} />
                            : <ProjectValue value={item} />}
                    </li>
                ))}
            </ul>
        );
    }

    if (typeof value === "object") {
        return (
            <div className="capstone-object">
                {Object.entries(value).map(([key, item]) => (
                    <section className="capstone-subsection" key={key}>
                        <h4>{formatLabel(key)}</h4>
                        <ProjectValue value={item} />
                    </section>
                ))}
            </div>
        );
    }

    return null;
}

export default function CapstoneProject({ project, moduleTitle }) {
    if (!project) return null;

    const heading = project.heading || moduleTitle || "Capstone Project";
    const description = project.description || "";

    return (
        <article className="capstone-project">
            <header className="capstone-hero">
                <span className="capstone-eyebrow">FINAL PROJECT</span>
                <h1>{heading}</h1>
                {description && <p>{description}</p>}
            </header>

            {Object.entries(LABELS).map(([key, label]) => {
                const value = project[key];
                if (value == null || value === "" || (Array.isArray(value) && !value.length)) {
                    return null;
                }

                return (
                    <section className="capstone-section" key={key}>
                        <h2>{label}</h2>
                        <ProjectValue value={value} />
                    </section>
                );
            })}
        </article>
    );
}
