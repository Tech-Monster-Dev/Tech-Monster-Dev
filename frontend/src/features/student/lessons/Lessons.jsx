import "./Lessons.css";
import {
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { useLocation, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";


import EmptyState from "../../../components/ui/EmptyState";
import Spinner from "../../dashboard/common/LoaderPage/Spinner";

import LessonSidebar from "./components/LessonSidebar";
import LessonContent from "./components/LessonContent";
import Pagination from "./components/Pagination";

import useLessonData from "./hooks/useLessonData";
import useLessonProgress from "./hooks/useLessonProgress";
import useApprovedModules from "./hooks/useApprovedModules";
import useLessonPreferences from "./hooks/useLessonPreferences";

import { applyModuleLocking } from "./utils/lessonLocking";
import { normalizeSlug } from "./utils/lessonHelpers";

export default function Lessons() {
    const { type: routeType, slug: routeSlug, courseSlug: routeCourseSlug } = useParams();

    const contentType = routeType === "internship" ? "internship" : "course";
    const courseSlug = normalizeSlug(routeSlug || routeCourseSlug || "");

    const location = useLocation();
    const navigationApprovedModuleId = location.state?.approvedModuleId || null;
    const navigationRecentCompletedLessonId =
        location.state?.recentCompletedLessonId || null;

    const [activeLesson, setActiveLesson] = useState(0);
    const [readPercent, setReadPercent] = useState(0);
    const [mobileLessonOpen, setMobileLessonOpen] = useState(false);

    const { lessonData, setLessonData, loading, error } = useLessonData(courseSlug, contentType);
    const {
        completedLessonIds,
        completeLesson,
        completedLessonsLoading,
    } = useLessonProgress(courseSlug, contentType);

    const {
        approvedModuleIds: approvedModuleIdsFromHook,
        approvedModulesLoading,
    } = useApprovedModules(
        courseSlug,
        lessonData
    );
    const approvedModuleIds = useMemo(() => {
        const next = new Set(approvedModuleIdsFromHook);

        if (navigationApprovedModuleId) {
            next.add(String(navigationApprovedModuleId).trim());
        }

        return next;
    }, [approvedModuleIdsFromHook, navigationApprovedModuleId]);

    const { search, setSearch, readingMode, setReadingMode } = useLessonPreferences();

    useLayoutEffect(() => {
        const element = document.querySelector("#lesson-content-wrapper .lesson-content-scroll-area");
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

    const initialLessonSelected = useRef(false);

    useEffect(() => {
        if (
            initialLessonSelected.current ||
            completedLessonsLoading ||
            approvedModulesLoading ||
            !finalLessonData?.modules?.length
        ) {
            return;
        }

        const allModulesCompleted = finalLessonData.modules.every(
            (module) =>
                module.sections?.length > 0 &&
                module.sections.every(
                    (section) => section.completed
                )
        );

        const latestUnlockedModule = [
            ...finalLessonData.modules,
        ].reverse().find(
            (module) => module.canStart
        );

        const recentCompletedLessonIndex =
            navigationRecentCompletedLessonId
                ? lessons.findIndex(
                    (lesson) =>
                        String(lesson.id) ===
                        String(navigationRecentCompletedLessonId)
                )
                : -1;

        const targetModule = allModulesCompleted
            ? finalLessonData.modules[0]
            : latestUnlockedModule || finalLessonData.modules[0];

        const targetLessonIndex = allModulesCompleted
            ? lessons.findIndex(
                (lesson) =>
                    lesson.id === targetModule?.sections?.[0]?.id
            )
            : recentCompletedLessonIndex !== -1
                ? recentCompletedLessonIndex
                : lessons.findIndex(
                    (lesson) =>
                        lesson.id === targetModule?.sections?.[0]?.id
                );

        if (targetLessonIndex !== -1) {
            setActiveLesson(targetLessonIndex);
            setReadPercent(0);
        }

        initialLessonSelected.current = true;
    }, [
        finalLessonData,
        lessons,
        completedLessonsLoading,
        approvedModulesLoading,
        navigationRecentCompletedLessonId,
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
                <div className="lesson-right" style={{ width: "100%" }}>
                    <Spinner message="Loading lesson content..." size={60} />
                </div>
            </motion.div>
        );
    }

    if (!routeType || !routeSlug) {
        return (
            <EmptyState
                fullPage
                heading="Enroll in a Course or Internship"
                paragraph="You have not enrolled in any course or internship yet. Please enroll in a course or internship first to start learning."
            />
        );
    }

    if (error || !finalLessonData || !lessons.length) {
        return (
            <motion.div className="lesson-layout">
                <div className="lesson-right" style={{ width: "100%" }}>
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

        const nextLesson = lessons[activeLesson + 1];

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
        }
    };

    const handleComplete = async () => {
        if (!currentLesson || currentLesson.completed) return;

        await completeLesson(currentLesson.id);
        setReadPercent(100);
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
            className={`lesson-layout ${readingMode ? "reading" : ""
                } ${mobileLessonOpen ? "mobile-lesson-open" : ""}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            <div
                className={`lession-left ${readingMode
                    ? "hidden!"
                    : mobileLessonOpen
                        ? "hidden! lg:block!"
                        : "block!"
                    }`}
            >
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
                            const index = lessons.findIndex(
                                (lesson) => lesson.id === lessonId
                            );

                            if (index !== -1) {
                                setActiveLesson(index);
                                setReadPercent(0);
                                setMobileLessonOpen(true);
                            }
                        }}
                    />
                )}
            </div>

            <div
                className={`lesson-right ${mobileLessonOpen || readingMode
                    ? "flex! w-full!"
                    : "hidden! lg:flex!"
                    }`}
            >
                <LessonContent
                    lesson={currentLesson}
                    lessonData={finalLessonData}
                    activeLesson={activeLesson}
                    handleComplete={handleComplete}
                    toggleBookmark={toggleBookmark}
                    readingMode={readingMode}
                    contentType={contentType}
                    setReadingMode={setReadingMode}
                    readPercent={readPercent}
                    completed={currentLesson.completed}
                    onScrollProgress={setReadPercent}
                    onBackToLessons={() => setMobileLessonOpen(false)}
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
