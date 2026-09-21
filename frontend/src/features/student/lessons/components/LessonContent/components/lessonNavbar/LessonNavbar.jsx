import './LessonNavbar.css'

import { motion } from 'framer-motion';

import ReadingMode from "./components/ReadingMode";
import CircularProgressBar from "./components/CircularProgress";
import BackButton from '../../../../../../../components/ui/Button/BackButton';

export default function LessonNavbar({
    readingMode,
    setReadingMode,
    readPercent,
    onBackToLessons,
}) {
    return (
        <>
            <motion.div
                className="lesson-fixed-navbar"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
            >
                <BackButton
                    label="Back to Lessons"
                    onClick={onBackToLessons}
                    className="max-lg:flex! lg:hidden!"
                />

                <ReadingMode
                    readingMode={readingMode}
                    setReadingMode={setReadingMode}
                    className="max-lg:hidden!"
                />

                <CircularProgressBar value={readPercent} />
            </motion.div>
        </>
    )
}
