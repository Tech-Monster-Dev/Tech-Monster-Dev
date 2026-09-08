import "./Practical.css";

import TryItYourself from "../TryItYourself";
import CodeBlock from "../CodeBlock";

const parseSolution = (solution) => {
    if (typeof solution !== "string") {
        return { code: "", language: "text" };
    }

    const fenced = solution.match(/^```([\w-]*)\s*\n([\s\S]*?)\n```$/);

    if (!fenced) {
        return { code: solution, language: "text" };
    }

    return {
        code: fenced[2],
        language: fenced[1] || "text",
    };
};

export default function Practical({
    practical,
    language = "javascript",
}) {
    if (!practical) return null;

    const {
        title = "",
        description = "",
        objective = "",
        steps = [],
        starterCode = "",
        solution = "",
        output = "",
        expectedOutput = "",
        instructions = [],
        deliverable = "",
        expectedOutcome = "",
        expectedEvidence = "",
        safetyBoundary = "",
    } = practical;

    const practicalCode = starterCode;
    const practicalOutput = expectedOutput || output;
    const solutionBlock = solution
        ? parseSolution(solution)
        : null;

    return (
        <section className="lesson-practical">
            <div className="lesson-practical__header">
                <div className="lesson-practical__icon">
                    &gt;_
                </div>

                <div>
                    <span className="lesson-practical__eyebrow">
                        PRACTICAL
                    </span>

                    <h3 className="lesson-practical__title">
                        {title || "Practice"}
                    </h3>
                </div>
            </div>

            {objective ? (
                <p className="lesson-practical__objective">
                    {objective}
                </p>
            ) : null}

            {description ? (
                <p className="lesson-practical__objective">
                    {description}
                </p>
            ) : null}

            {Array.isArray(instructions) && instructions.length > 0 ? (
                <div className="lesson-practical__steps">
                    <h4>Instructions</h4>
                    <ol>
                        {instructions.map((instruction, index) => (
                            <li key={`${String(instruction)}-${index}`}>
                                {instruction}
                            </li>
                        ))}
                    </ol>
                </div>
            ) : null}

            {Array.isArray(steps) && steps.length > 0 ? (
                <div className="lesson-practical__steps">
                    <h4>Steps</h4>

                    <ol>
                        {steps.map((step, index) => (
                            <li key={`${String(step)}-${index}`}>
                                {step}
                            </li>
                        ))}
                    </ol>
                </div>
            ) : null}

            {practicalCode ? (
                <TryItYourself key={practicalCode}
                    language={language}
                    starterCode={practicalCode}
                />
            ) : null}

            {solutionBlock?.code ? (
                <CodeBlock
                    code={solutionBlock.code}
                    language={solutionBlock.language}
                />
            ) : null}

            {practicalOutput ? (
                <div className="lesson-practical__expected">
                    <div className="lesson-practical__expected-label">
                        Expected Output
                    </div>

                    <pre>
                        {practicalOutput}
                    </pre>
                </div>
            ) : null}

            {deliverable || expectedOutcome || expectedEvidence || safetyBoundary ? (
                <div className="lesson-practical__expected">
                    {deliverable ? <p><strong>Deliverable:</strong> {deliverable}</p> : null}
                    {expectedOutcome ? <p><strong>Expected outcome:</strong> {expectedOutcome}</p> : null}
                    {expectedEvidence ? <p><strong>Expected evidence:</strong> {expectedEvidence}</p> : null}
                    {safetyBoundary ? <p><strong>Safety boundary:</strong> {safetyBoundary}</p> : null}
                </div>
            ) : null}
        </section>
    );
}
