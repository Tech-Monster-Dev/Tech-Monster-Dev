import "./LessonPage.css";

import Heading from "./components/Heading";
import Paragraph from "./components/Paragraph";
import Image from "./components/Image";
import Lists from "./components/Lists";
import CodeBlock from "./components/CodeBlock";
import NotePoint from "./components/NotePoint";
import LessonCallout from "./components/LessonCallout";
import Practical from "./components/Practical";
import Quiz from "./components/Quiz";
import LearningObjectives from "./components/LearningObjectives/LearningObjectives.jsx";
import LessonSummary from "./components/LessonSummary";
import LessonResources from "./components/LessonResources";


export default function LessonPage({ lesson }) {
    const rawLesson =
        lesson?.lesson ||
        lesson ||
        {};

    const notes = Array.isArray(rawLesson?.notes)
        ? rawLesson.notes
        : [];

    const practicals = Array.isArray(rawLesson?.practicals)
        ? rawLesson.practicals
        : [];

    const quiz = Array.isArray(rawLesson?.quiz)
        ? rawLesson.quiz
        : [];

    const getSemanticTone = (index) => {
        for (let i = index - 1; i >= 0; i -= 1) {
            const previousNote = notes[i];

            if (previousNote?.type !== "heading") {
                continue;
            }

            const headingText = String(previousNote.text || "")
                .trim()
                .toLowerCase();

            if (
                headingText.includes("common mistakes") ||
                headingText.includes("mistakes") ||
                headingText.includes("common errors")
            ) {
                return "warning";
            }

            if (
                headingText.includes("core ideas") ||
                headingText.includes("key concepts") ||
                headingText.includes("concepts")
            ) {
                return "info";
            }

            if (
                headingText.includes("best practices") ||
                headingText.includes("best practice") ||
                headingText.includes("recommended practices")
            ) {
                return "success";
            }

            return "";
        }

        return "";
    };

    const renderNote = (note, index) => {
        if (!note) return null;

        const key =
            `${note.type || "note"}-${index}`;

        const semanticTone =
            getSemanticTone(index);

        switch (note.type) {
            case "heading":
                return (
                    <Heading
                        key={key}
                        title={note.text}
                        level={note.level}
                    />
                );

            case "paragraph":
                return (
                    <Paragraph
                        key={key}
                        text={note.text}
                    />
                );

            case "image":
                return (
                    <Image
                        key={key}
                        src={note.src}
                        alt={note.alt}
                        caption={note.caption}
                    />
                );

            case "unorderedList":
                return (
                    <Lists
                        key={key}
                        items={note.items}
                        ordered={false}
                        tone={semanticTone}
                    />
                );

            case "orderedList":
                return (
                    <Lists
                        key={key}
                        items={note.items}
                        ordered
                        tone={semanticTone}
                    />
                );

            case "code":
                return (
                    <CodeBlock
                        key={key}
                        code={note.code}
                        language={note.language}
                        filename={note.filename}
                    />
                );

            case "tip":
                return (
                    <LessonCallout
                        key={key}
                        type="tip"
                        title={note.title}
                        text={note.text}
                    />
                );

            case "warning":
                return (
                    <LessonCallout
                        key={key}
                        type="warning"
                        title={note.title}
                        text={note.text}
                    />
                );

            case "checklist":
                return (
                    <NotePoint
                        key={key}
                        points={note.items}
                    />
                );

            default:
                return null;
        }
    };

    if (!notes.length && !practicals.length) {
        return (
            <div id="lesson-page">
                <Paragraph
                    text="No lesson content is available for this lesson yet."
                />
            </div>
        );
    }

    return (
        <div id="lesson-page">
            <section className="lesson-section">
                <LearningObjectives
                    objectives={rawLesson.learningObjectives}
                />

                {notes.map(renderNote)}

                {practicals.length > 0 ? (
                    <div className="lesson-practicals">
                        {practicals.map(
                            (practical, index) => (
                                <Practical
                                    key={
                                        practical.id ||
                                        `practical-${index}`
                                    }
                                    practical={practical}
                                    language={rawLesson.language || "javascript"}
                                />
                            )
                        )}
                    </div>
                ) : null}
                {quiz.length > 0 ? (
                    <Quiz
                        questions={quiz}
                    />
                ) : null}

                <LessonSummary
                    summary={rawLesson.summary}
                />

                <LessonResources
                    resources={rawLesson.resources}
                />
            </section>
        </div>
    );
}
