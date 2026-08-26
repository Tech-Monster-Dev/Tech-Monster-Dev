import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import api from "../../../../services/api/axios";
import { API } from "../../../../services/api/endpoints";

const useLessonProgress = (
    courseSlug,
    contentType
) => {

    const [completedLessonIds, setCompletedLessonIds] = useState([]);

    useEffect(() => {
        if (!courseSlug) return;
        let active = true;
        const fetchCompleted = async () => {

            // Try to load from cache
            try {
                const raw = localStorage.getItem(
                    `completedLessons_${courseSlug}`
                );

                if (raw) {
                    const cached = JSON.parse(raw);
                    if (Array.isArray(cached)) {
                        setCompletedLessonIds(cached);
                    }
                }

            } catch {
                // Ignore invalid cache
            }
            // ============================================

            // Try to load from API endpoint
            try {
                const endpoint = contentType === "course" ? API.COURSES.COMPLETED_LESSONS(courseSlug) : API.INTERNSHIPS.COMPLETED_LESSONS(courseSlug);

                const response = await api.get(endpoint);

                const lessons = response?.data?.completedLessons;

                // If active, update state
                if (active && Array.isArray(lessons)) {
                    setCompletedLessonIds(lessons);
                    localStorage.setItem(
                        `completedLessons_${courseSlug}`,
                        JSON.stringify(lessons)
                    );
                }

            } catch (err) {
                const message = err?.response?.data?.message || err?.message;
                console.error(message);
                toast.error("Unable to load completed lessons.");
            }
        };

        // ==========================================================

        fetchCompleted();

        return () => {
            active = false;
        };

    }, [courseSlug, contentType]);


    useEffect(() => {

        if (!courseSlug) return;

        localStorage.setItem(
            `completedLessons_${courseSlug}`,
            JSON.stringify(completedLessonIds)
        );

    }, [
        completedLessonIds,
        courseSlug
    ]);


    const completeLesson = async (lessonId) => {
        if (completedLessonIds.includes(lessonId)) {
            return;
        }

        const updated = [
            ...completedLessonIds,
            lessonId
        ];

        setCompletedLessonIds(updated);

        try {
            localStorage.setItem(
                `completedLessons_${courseSlug}`,
                JSON.stringify(updated)
            );

        } catch {
            // Ignore localStorage error
        }

        const endpoint = contentType === "course" ? API.COURSES.COMPLETE_LESSON(courseSlug) : API.INTERNSHIPS.COMPLETE_LESSON(courseSlug);

        try {
            await api.post(endpoint, { lessonId });
        } catch {
            // Local progress remains available.
        }
    };


    return {
        completedLessonIds,
        setCompletedLessonIds,
        completeLesson
    };
};

export default useLessonProgress;