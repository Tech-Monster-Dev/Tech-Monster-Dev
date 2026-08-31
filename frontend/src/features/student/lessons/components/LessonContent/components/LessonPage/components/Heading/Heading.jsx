import "./Heading.css";

export default function Heading({
    title,
    level = 2,
}) {
    if (!title) return null;

    const safeLevel = Math.min(
        Math.max(Number(level) || 2, 2),
        4
    );

    const normalizedTitle = String(title)
        .trim()
        .toLowerCase();

    let semanticClass = "";

    if (
        normalizedTitle.includes("common mistakes") ||
        normalizedTitle.includes("mistakes") ||
        normalizedTitle.includes("common errors")
    ) {
        semanticClass = "lesson-heading--warning";
    } else if (
        normalizedTitle.includes("core ideas") ||
        normalizedTitle.includes("key concepts") ||
        normalizedTitle.includes("concepts")
    ) {
        semanticClass = "lesson-heading--info";
    } else if (
        normalizedTitle.includes("best practices") ||
        normalizedTitle.includes("recommended practices") ||
        normalizedTitle.includes("best practice")
    ) {
        semanticClass = "lesson-heading--success";
    }

    const HeadingTag = `h${safeLevel}`;

    return (
        <HeadingTag
            className={[
                "lesson-heading",
                `lesson-heading--level-${safeLevel}`,
                semanticClass,
            ]
                .filter(Boolean)
                .join(" ")}
        >
            {title}
        </HeadingTag>
    );
}
