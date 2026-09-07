import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";

import api from "../../../../services/api/axios";
import { API } from "../../../../services/api/endpoints";
import { getWebsiteFeedback, getMyCourseFeedback, getMyInternshipFeedback } from "../../../../services/api/feedback.service";
import { socket } from "../../../../services/socket/socket";

export default function useFeedbackData() {
    const [courses, setCourses] = useState([]);
    const [internships, setInternships] = useState([]);
    const [websiteFeedback, setWebsiteFeedback] = useState([]);
    const [courseFeedback, setCourseFeedback] = useState([]);
    const [internshipFeedback, setInternshipFeedback] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadData = useCallback(async () => {
        try {
            setLoading(true);

            const [dashboardResponse, feedbackResponse, courseFeedbackResponse, internshipFeedbackResponse] = await Promise.all([
                api.get(API.DASHBOARD.STUDENT),
                getWebsiteFeedback(),
                getMyCourseFeedback(),
                getMyInternshipFeedback(),
            ]);

            const dashboard = dashboardResponse.data?.dashboard || {};

            setCourses(dashboard.courses || []);
            setInternships(dashboard.internships || []);
            setWebsiteFeedback(feedbackResponse.feedback || []);
            setCourseFeedback(courseFeedbackResponse.feedback || []);
            setInternshipFeedback(internshipFeedbackResponse.feedback || []);
        } catch (error) {
            console.error("Feedback data loading failed:", error);

            toast.error(
                error?.response?.data?.message ||
                "Unable to load feedback data."
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        let mounted = true;

        const load = async () => {
            if (mounted) {
                await loadData();
            }
        };

        queueMicrotask(load);

        const handleFeedbackCreated = (payload) => {
            const feedback = payload?.feedback;

            if (feedback == null) {
                return;
            }

            if (feedback.type === "website") {
                setWebsiteFeedback((current) => {
                    const exists = current.some(
                        (item) => item._id === feedback._id
                    );

                if (exists) {
                    return current;
                }

                    return [feedback, ...current].slice(0, 5);
                });
            }

            if (feedback.type === "course") {
                setCourseFeedback((current) => {
                    const exists = current.some(
                        (item) => item._id === feedback._id
                    );

                    if (exists) {
                        return current;
                    }

                    return [feedback, ...current].slice(0, 5);
                });
            }

            if (feedback.type === "internship") {
                setInternshipFeedback((current) => {
                    const exists = current.some(
                        (item) => item._id === feedback._id
                    );

                    if (exists) {
                        return current;
                    }

                    return [feedback, ...current].slice(0, 5);
                });
            }
        };

        socket.on("feedbackCreated", handleFeedbackCreated);

        return () => {
            mounted = false;
            socket.off("feedbackCreated", handleFeedbackCreated);
        };
    }, [loadData]);

    return {
        courses,
        internships,
        websiteFeedback,
        courseFeedback,
        internshipFeedback,
        loading,
        reloadFeedback: loadData,
        setWebsiteFeedback,
    };
}
