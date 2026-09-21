import "./ReadingMode.css";
import { motion } from "framer-motion";
import { BookOpen, BookOpenCheck } from "lucide-react";

export default function ReadingMode({
    readingMode,
    setReadingMode,
    className = ""
}) {

    return (
        <motion.button
            className={`reading-mode-btn ${readingMode ? "active" : ""} ${className}`}
            onClick={() => setReadingMode(!readingMode)}
            title={readingMode ? "Exit Reading Mode" : "Reading Mode"}
        >
            {readingMode ? <BookOpenCheck size={20} /> : <BookOpen size={20} />}
        </motion.button>
    );
}