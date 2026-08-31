import { motion } from "framer-motion";
import { useRef, useEffect } from "react";

import "./LessonContent.css";

import LessonNavbar from "./components/lessonNavbar";
import LessonHeader from "./components/LessonHeader";
import LessonPage from "./components/LessonPage";

export default function LessonContent({
    lesson,
    toggleBookmark,
    handleComplete,
    readingMode,
    setReadingMode,
    onScrollProgress,
    readPercent = 0,
    completed = false,
    contentRef,
}) {
    const innerRef = useRef(null);

    /*
     * The actual scroll container is the middle content area.
     * Navbar and Pagination stay outside this scrolling region.
     */
    const contentRefFinal = contentRef || innerRef;

    useEffect(() => {
        const el = contentRefFinal.current;

        if (!el) return;

        const handleScroll = () => {
            const scrollable =
                el.scrollHeight - el.clientHeight;

            const percent =
                scrollable <= 0
                    ? 100
                    : Math.min(
                          100,
                          Math.max(
                              0,
                              Math.round(
                                  (el.scrollTop / scrollable) * 100
                              )
                          )
                      );

            if (typeof onScrollProgress === "function") {
                onScrollProgress(percent);
            }

            if (percent >= 98 && !completed) {
                handleComplete();
            }
        };

        el.addEventListener(
            "scroll",
            handleScroll,
            { passive: true }
        );

        return () => {
            el.removeEventListener(
                "scroll",
                handleScroll
            );
        };
    }, [
        contentRefFinal,
        onScrollProgress,
        handleComplete,
        completed,
    ]);

    const displayPercent =
        completed ? 100 : readPercent;

    return (
        <motion.div
            id="lesson-content-wrapper"
            className="lesson-content-root"
            initial={{ opacity: 0, x: 25 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45 }}
        >
            {/* =========================================
                FIXED LESSON NAVBAR
            ========================================= */}
            <div className="lesson-navbar-fixed">
                <LessonNavbar
                    readingMode={readingMode}
                    setReadingMode={setReadingMode}
                    readPercent={displayPercent}
                />
            </div>

            {/* =========================================
                ONLY THIS AREA SCROLLS
            ========================================= */}
            <div
                ref={contentRefFinal}
                className="lesson-content-scroll-area"
            >
                <LessonHeader
                    toggleBookmark={toggleBookmark}
                    lesson={lesson}
                />

                <LessonPage
                    lesson={lesson}
                />
            </div>
        </motion.div>
    );
}
