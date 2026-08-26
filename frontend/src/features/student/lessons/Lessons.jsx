import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";

import "./Lessons.css";

import LessonSidebar from "./components/LessonSidebar";
import LessonContent from "./components/LessonContent";
import Pagination from "./components/Pagination";
import Spinner from "../../dashboard/common/LoaderPage/Spinner";

import useLessonData from "./hooks/useLessonData";
import useLessonProgress from "./hooks/useLessonProgress";
import useApprovedModules from "./hooks/useApprovedModules";
import useLessonPreferences from "./hooks/useLessonPreferences";

import { applyModuleLocking } from "./utils/lessonLocking";
import { normalizeSlug } from "./utils/lessonHelpers";

export default function Lessons() {
    const { type: routeType, slug: routeSlug, courseSlug: routeCourseSlug } = useParams();
    const contentContainerRef = useRef(null);

    const contentType = routeType === "internship" ? "internship" : "course";
    const courseSlug = normalizeSlug(routeSlug || routeCourseSlug || "");

    const [activeLesson, setActiveLesson] = useState(0);
    const [readPercent, setReadPercent] = useState(0);

    const { lessonData, setLessonData, loading, error } = useLessonData(courseSlug, contentType);
    const { completedLessonIds, completeLesson } = useLessonProgress(courseSlug, contentType);

    const approvedModuleIds = useApprovedModules(courseSlug, lessonData);

    const { search, setSearch, readingMode, setReadingMode } = useLessonPreferences();

    useLayoutEffect(() => {
        const element = contentContainerRef.current;
        if (!element) return;

        element.style.scrollBehavior = "auto";
        element.scrollTop = 0;
    }, [activeLesson]);

    const finalLessonData = useMemo(() => {
        if (!lessonData?.modules) return lessonData;

        const completedSet = new Set(completedLessonIds);

        const modules = lessonData.modules.map((module) => ({
            ...module,
            sections: module.sections.map((section) => ({
                ...section,
                completed: completedSet.has(section.id)
            }))
        }));

        return applyModuleLocking(
            {
                ...lessonData,
                modules,
                lessons: modules.flatMap((module) => module.sections)
            },
            approvedModuleIds
        );
    }, [lessonData, completedLessonIds, approvedModuleIds]);

    const lessons = finalLessonData?.lessons || [];
    const currentLesson = lessons[activeLesson] || null;

    // =========================================
    // DAILY TASK LIVE ACCESS
    // =========================================
    useEffect(() => {
        if (!courseSlug || !finalLessonData?.modules) {
            return;
        }

        const readyModule = finalLessonData.modules.find((module) => {
            const moduleId = String(module.id || module.moduleId || "");
            const sections = module.sections || [];

            return (
                sections.length > 0 &&
                sections.every((section) =>
                    section.completed
                ) && !approvedModuleIds.has(moduleId)
            );
        });

        console.log("🟢 Ready Module:", readyModule?.id);

        const dailyTaskUnlocked = Boolean(readyModule);
        console.log("🟢 Daily Task Unlocked:", dailyTaskUnlocked);

        try {
            localStorage.setItem(
                "daily_task_unlocked_" + courseSlug,
                dailyTaskUnlocked ? "true" : "false"
            );
        } catch {
            // Ignore localStorage errors.
        }

        console.log("lession page data",localStorage.getItem("daily_task_unlocked_" + courseSlug));
        console.log("lession page data",localStorage.getItem(dailyTaskUnlocked));

        console.log("🚨 DAILY TASK EVENT DISPATCH:", { courseSlug, unlocked: dailyTaskUnlocked, moduleId: readyModule?.id || null });

        window.dispatchEvent(new CustomEvent("dailyTaskAccessChanged",
            {
                detail: {
                    courseSlug,
                    unlocked: dailyTaskUnlocked,
                    moduleId: readyModule?.id || null,
                },
            }
        ));
    }, [
        courseSlug,
        finalLessonData,
        approvedModuleIds,
    ]);

    const filteredLessons = useMemo(() => {
        if (!finalLessonData?.modules) return [];

        const query = search.toLowerCase();

        return finalLessonData.modules.filter((module) => {
            const matchesModule = module.title.toLowerCase().includes(query);
            const matchesLesson = module.sections.some((section) => section.heading.toLowerCase().includes(query));

            return matchesModule || matchesLesson;
        });
    }, [finalLessonData, search]);

    if (loading) {
        return (
            <motion.div
                className="lesson-layout"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
            >
                <div id="lesson-right" style={{ width: "100%" }}>
                    <Spinner message="Loading lesson content..." size={60} />
                </div>
            </motion.div>
        );
    }

    if (error || !finalLessonData || !lessons.length) {
        return (
            <motion.div className="lesson-layout">
                <div id="lesson-right" style={{ width: "100%" }}>
                    <div className="lesson-page--error">
                        {error || "No lesson content found."}
                    </div>
                </div>
            </motion.div>
        );
    }

    const handleNext = () => {
        if (activeLesson >= lessons.length - 1) {
            return;
        }

        const nextLesson =
            lessons[activeLesson + 1];

        // Do not allow pagination to bypass lesson/module locking.
        if (nextLesson?.locked) {
            toast.warning("Complete the current module and get Admin approval before continuing!");
            return;
        }

        setActiveLesson((prev) => prev + 1);
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: "auto"
        });
    };

    const handlePrevious = () => {
        if (activeLesson > 0) {
            setActiveLesson((prev) => prev - 1);
            contentContainerRef.current?.scrollTo({
                top: 0,
                left: 0,
                behavior: "auto"
            });
        }
    };

    const handleComplete = async () => {
        if (!currentLesson || currentLesson.completed) return;

        await completeLesson(currentLesson.id);
        setReadPercent(100);
        toast.success("Lesson Completed 🎉");
    };

    const toggleBookmark = () => {
        if (!currentLesson) return;

        const updatedModules = lessonData.modules.map((module) => ({
            ...module,
            sections: module.sections.map((lesson) =>
                lesson.id === currentLesson.id
                    ? { ...lesson, bookmarked: !lesson.bookmarked }
                    : lesson
            )
        }));

        setLessonData({
            ...lessonData,
            modules: updatedModules,
            lessons: updatedModules.flatMap((module) => module.sections)
        });

        if (currentLesson.bookmarked) {
            toast.info("Bookmark removed");
        } else {
            toast.success("Lesson bookmarked ⭐");
        }
    };

    const completedLessons = lessons.filter((lesson) => lesson.completed).length;
    const progress = lessons.length ? Math.round((completedLessons / lessons.length) * 100) : 0;

    return (
        <motion.div
            className={`lesson-layout ${readingMode ? "reading" : ""}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            <div id="lession-left">
                {!readingMode && (
                    <LessonSidebar
                        lessonData={finalLessonData}
                        filteredLessons={filteredLessons}
                        search={search}
                        setSearch={setSearch}
                        lessons={lessons}
                        activeLesson={currentLesson.id}
                        progress={progress}
                        completedLessons={completedLessons}
                        courseSlug={courseSlug}
                        contentType={contentType}
                        approvedModuleIds={approvedModuleIds}
                        setActiveLesson={(lessonId) => {
                            const index = lessons.findIndex((lesson) => lesson.id === lessonId);
                            if (index !== -1) {
                                setActiveLesson(index);
                                setReadPercent(0);
                            }
                        }}
                    />
                )}
            </div>

            <div id="lesson-right">
                <LessonContent
                    lesson={currentLesson}
                    lessonData={finalLessonData}
                    activeLesson={activeLesson}
                    handleComplete={handleComplete}
                    toggleBookmark={toggleBookmark}
                    readingMode={readingMode}
                    setReadingMode={setReadingMode}
                    readPercent={readPercent}
                    completed={currentLesson.completed}
                    onScrollProgress={setReadPercent}
                    contentRef={contentContainerRef}
                />

                <Pagination
                    current={activeLesson}
                    total={lessons.length}
                    onPrevious={handlePrevious}
                    onNext={handleNext}
                />
            </div>
        </motion.div>
    );
}