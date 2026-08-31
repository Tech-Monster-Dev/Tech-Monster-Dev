import "./Paragraph.css";

export default function Paragraph({ text }) {
    if (!text) return null;

    return (
        <p className="lesson-paragraph">
            {text}
        </p>
    );
}
