import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import api from "../../../../services/api/axios";
import { API } from "../../../../services/api/endpoints";

import { normalizeLessonData } from "../utils/normalizeLessonData";

const getContentEndpoint = (
    type,
    slug
) => {
    if (type === "internship") {
        const internshipEndpoint = API.INTERNSHIPS.BY_SLUG ? API.INTERNSHIPS.BY_SLUG(slug) : `/internships/slug/${slug}`;
        return internshipEndpoint;
    }

    const courseEndpoint = API.COURSES.BY_SLUG ? API.COURSES.BY_SLUG(slug) : `/courses/slug/${slug}`;
    return courseEndpoint;
};

const useLessonData = (
    courseSlug,
    contentType
) => {

    const [lessonData, setLessonData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!courseSlug) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setError("Learning content not found.");
            setLoading(false);
            return;
        }

        let mounted = true;

        const fetchLearningContent = async () => {
            try {
                setLoading(true);
                setError(null);

                const endpoint = getContentEndpoint(contentType, courseSlug);
                const response = await api.get(endpoint);

                if (!mounted) return;

                const data = response?.data?.course|| response?.data?.internship || response?.data?.data || response?.data || null;

                if (!data) {
                    throw new Error(
                        `${contentType} content could not be loaded.`
                    );
                }
                const normalized = normalizeLessonData(data);
                setLessonData(normalized);
            } catch (err) {
                if (!mounted) return;
                console.error(
                    "Learning content error:",
                    err
                );
                const message = err?.response?.data?.message || err?.message || `Unable to load ${contentType} content.`;
                setError(message);
                toast.error("Unable to load learning content.");
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };
        fetchLearningContent();

        return () => {
            mounted = false;
        };

    }, [courseSlug, contentType]);

    return {
        lessonData,
        setLessonData,
        loading,
        error
    };
};

export default useLessonData;