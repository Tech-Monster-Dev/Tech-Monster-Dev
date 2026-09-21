import './LessonHeader.css';

import { motion } from 'framer-motion';
import LessonBookmark from "./components/Bookmark";

import {
    BookOpen,
} from "lucide-react";

export default function LessonHeader({
    lesson,
    toggleBookmark,
    contentType
}) {
    return (
        <>
            <motion.div
                className="lesson-content-header glass-card"
                initial={{ opacity: 0, y: -25 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="lesson-content-header-badge">
                    <BookOpen size={18} />
                    {contentType.charAt(0).toUpperCase() + contentType.slice(1)} Lesson
                </div>
                <h1>{lesson.heading}</h1>
                <p>
                    Read every topic carefully before moving to the next lesson.
                </p>
                <div className="lesson-content-header-actions">
                    <LessonBookmark
                        bookmarked={lesson.bookmarked}
                        onToggle={toggleBookmark}
                    />
                </div>
            </motion.div>
        </>
    )
}