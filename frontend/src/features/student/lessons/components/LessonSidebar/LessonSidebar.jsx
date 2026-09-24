import "./LessonSidebar.css";
import { useEffect, useRef, useState } from "react";
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

    const [openModuleId, setOpenModuleId] = useState(null);
    const moduleRefs = useRef({});

    useEffect(() => {
        if (!filteredLessons?.length) {
            return;
        }

        const allModulesCompleted = filteredLessons.every(
            (module) =>
                module.sections?.length > 0 &&
                module.sections.every(
                    (section) => section.completed
                )
        );

        const latestUnlockedModule = [
            ...filteredLessons,
        ]
            .reverse()
            .find(
                (module) => module.canStart
            );

        const targetModule = allModulesCompleted
            ? filteredLessons[0]
            : latestUnlockedModule || filteredLessons[0];

        if (!targetModule) {
            return;
        }

        setOpenModuleId(String(targetModule.id));

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                const moduleElement =
                    moduleRefs.current[String(targetModule.id)];

                if (!moduleElement) {
                    return;
                }

                moduleElement.scrollIntoView({
                    behavior: "smooth",
                    block: "nearest",
                    inline: "nearest",
                });
            });
        });
    }, [filteredLessons]);

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
                        <div
                            key={lesson.id}
                            ref={(element) => {
                                moduleRefs.current[
                                    String(lesson.id)
                                ] = element;
                            }}
                        >
                            <LessonAccordion
                                lesson={lesson}
                                module={lesson.sections}
                                moduleId={lesson.id}
                                open={
                                    openModuleId ===
                                    String(lesson.id)
                                }
                                onToggle={(nextOpen) => {
                                    setOpenModuleId(
                                        nextOpen
                                            ? String(lesson.id)
                                            : null
                                    );
                                }}
                                activeLesson={activeLesson}
                                setActiveLesson={setActiveLesson}
                                courseSlug={courseSlug}
                                contentType={contentType}
                                approvedModuleIds={approvedModuleIds}
                                canStart={lesson.canStart !== false}
                                moduleNumber={moduleIndex + 1}
                            />
                        </div>
                    ))
                }
            </div>

            {/* Footer */}
            <div className="lesson-sidebar-footer" >
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