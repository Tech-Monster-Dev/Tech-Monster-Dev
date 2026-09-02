import "./Practical.css";

import TryItYourself from "../TryItYourself";

export default function Practical({
    practical,
    language = "javascript",
}) {
    if (!practical) return null;

    const {
        title = "",
        objective = "",
        steps = [],
        starterCode = "",
        expectedOutput = "",
    } = practical;

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

            {starterCode ? (
                <TryItYourself key={starterCode} 
                    language={language}
                    starterCode={starterCode}
                />
            ) : null}

            {expectedOutput ? (
                <div className="lesson-practical__expected">
                    <div className="lesson-practical__expected-label">
                        Expected Output
                    </div>

                    <pre>
                        {expectedOutput}
                    </pre>
                </div>
            ) : null}
        </section>
    );
}
