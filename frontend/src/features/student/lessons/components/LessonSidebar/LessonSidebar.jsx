import "./LessonSidebar.css";
import { motion } from "framer-motion";
import { BookOpen } from "lucide-react";

import LessonSearch from "./components/LessonSearch";
import LessonAccordion from "./components/LessonAccordion";

export default function LessonSidebar({
    lessonData,
    lessons,
    activeLesson,
    setActiveLesson,
    search,
    setSearch,
    filteredLessons,
    progress,
    completedLessons,
    courseSlug,
    contentType,
    approvedModuleIds = new Set()
}) {

    return (
        <motion.aside
            className="lesson-sidebar"
            initial={{ x: -40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{
                duration: 0.5,
            }}
        >
            {/* Header */}

            <div className="lesson-sidebar-header">
                <LessonSearch
                    search={search}
                    setSearch={setSearch}
                />

                <div className="lesson_sidebar_heading_content">
                    <div className="lesson_sidebar_heading_icon">
                        <BookOpen size={22} />
                        <h2>{contentType.charAt(0).toUpperCase() + contentType.slice(1)} Lessons</h2>
                    </div>
                    <p>{lessonData?.modules?.length} Modules</p>
                </div>
            </div>

            {/* Lesson List */}

            <div className="lesson-lists">
                {
                    filteredLessons.map((lesson, moduleIndex) => (
                        <LessonAccordion
                            lesson={lesson}
                            key={lesson.id}
                            module={lesson.sections}
                            moduleId={lesson.id}
                            activeLesson={activeLesson}
                            setActiveLesson={setActiveLesson}
                            courseSlug={courseSlug}
                            contentType={contentType}
                            approvedModuleIds={approvedModuleIds}
                            canStart={lesson.canStart !== false}
                            moduleNumber={moduleIndex + 1}
                        />
                    ))
                }
            </div>

            {/* Footer */}

            <div className="lesson-sidebar-footer">
                <h4>Course Progress</h4>
                <div className="sidebar-progress">
                    <div
                        className="sidebar-progress-fill"
                        style={{ width: `${progress}%` }}
                    />
                </div>
                <span>
                    {completedLessons} / {lessons.length} Lessons Completed
                </span>
                <small>
                    {progress}% Completed
                </small>
            </div>
        </motion.aside>
    );
}