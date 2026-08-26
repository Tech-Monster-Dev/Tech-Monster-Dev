import { useEffect, useState, useCallback } from "react";

import api from "../../../../services/api/axios";
import { getProfile } from "../../../../services/api/profileService";
import { getMyCourseSubmissions } from "../../../../services/api/submissionService";
import useAuth from "../../../../shared/hooks/useAuth";

import {
    loadTaskState,
    saveTaskState,
    clearTaskState,
} from "../../../../utils/taskStorage";

import {
    normalizeSlug,
    buildModules,
    getTaskKey,
    getContentFromResponse,
} from "../utils/taskUtils";
import { toast } from "react-toastify";
import { getSubmissionState } from "../utils/applySubmissionState";
import { resolveContentSlug } from "../utils/contentSlugResolver";
import { getSubmissionsFromResponse, getPreferredSubmissions, buildSubmissionMaps } from "../utils/submissionState";

const TESTING_RESET_ON_REFRESH = false;

const useTaskData = ({
    contentType,
    routeCourseSlug,
    slug,
}) => {

    const { user } = useAuth();

    const getApiResource = (type) => {
        return type === "internship"
            ? "internships"
            : "courses";
    };

    const [courseSlug, setCourseSlug] = useState(
        normalizeSlug(routeCourseSlug || slug || "")
    );

    const [courseTitle, setCourseTitle] = useState("Internship");
    const [studentName, setStudentName] = useState("Student");

    const [modules, setModules] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [taskStatusMap, setTaskStatusMap] = useState({});
    const [deadlineMap, setDeadlineMap] = useState({});
    const [submissionIdMap, setSubmissionIdMap] = useState({});
    const [submittedAtMap, setSubmittedAtMap] = useState({});
    const [reviewCommentMap, setReviewCommentMap] = useState({});
    const [initialTaskId, setInitialTaskId] = useState(null);

    const applySubmissionState = useCallback(
        (submission) => {
            const state = getSubmissionState(
                submission
            );

            if (!state) {
                return;
            }

            const key = getTaskKey(submission);

            if (!key) {
                return;
            }

            setTaskStatusMap((prev) => {
                const next = {
                    ...prev,
                    [key]: state.status,
                };

                if (courseSlug) {
                    saveTaskState(
                        user?._id || user?.id,
                        courseSlug,
                        next
                    );
                }

                return next;
            });

            if (state.submittedAt) {
                setSubmittedAtMap((prev) => ({
                    ...prev,
                    [key]: state.submittedAt,
                }));
            }

            setDeadlineMap((prev) => ({
                ...prev,
                [key]: state.deadline,
            }));

            setReviewCommentMap((prev) => ({
                ...prev,
                [key]: state.reviewComment,
            }));

            setSubmissionIdMap((prev) => ({
                ...prev,
                [key]: state.submissionId,
            }));
        },
        [
            courseSlug,
            user?._id,
            user?.id,
        ]
    );

    useEffect(() => {
        let mounted = true;

        const load = async () => {
            try {
                setLoading(true);
                setError(null);

                // -----------------------------------------
                // STUDENT PROFILE
                // -----------------------------------------
                try {

                    const profileRes = await getProfile();
                    const profile = profileRes?.data?.user || profileRes?.data || {};
                    const name =
                        [
                            profile.firstName,
                            profile.lastName,
                        ]
                            .filter(Boolean)
                            .join(" ") ||
                        profile.name ||
                        profile.username ||
                        "Student";

                    if (mounted) {
                        setStudentName(name);
                    }

                } catch (err) {
                    toast.error("Profile could not be loaded.");
                    console.log("Profile Error:=", err);
                }

                // -----------------------------------------
                // COURSE SLUG
                // -----------------------------------------

                let targetSlug = courseSlug;

                if (!targetSlug) {
                    targetSlug = await resolveContentSlug(contentType);

                    if (mounted && targetSlug) {
                        setCourseSlug(targetSlug)
                    }
                }

                if (!targetSlug) {
                    if (mounted) {
                        setError("No internship found. Please enroll in a course first.");
                        setLoading(false);
                    }

                    return;
                }

                // -----------------------------------------
                // COURSE DATA
                // -----------------------------------------

                const resource = getApiResource(contentType);
                const response = await api.get(`/${resource}/slug/${targetSlug}`);

                const contentData = getContentFromResponse(response);

                if (!contentData) {
                    if (mounted) {
                        setError("Course content could not be loaded.");
                        setLoading(false);
                    }
                    return;
                }

                if (!mounted) return;
                setCourseTitle(contentData.title || contentType || "Content");
                const builtModules = buildModules(contentData);
                setModules(builtModules);

                // -----------------------------------------
                // LOCAL TASK STATE
                // -----------------------------------------

                let stored = {};

                if (TESTING_RESET_ON_REFRESH) {
                    clearTaskState(user?._id || user?.id, targetSlug);
                    stored = {};
                } else {
                    stored = loadTaskState(user?._id || user?.id, targetSlug);
                }

                setTaskStatusMap(stored);

                // -----------------------------------------
                // BACKEND SUBMISSIONS
                // -----------------------------------------
                // TESTING MODE:
                // Ignore previously stored server submissions
                // on refresh so testing always starts fresh.
                // Database records are NOT deleted.

                const flatTasks = builtModules.flatMap(
                    (module) => module.tasks
                );

                const latestMap = {
                    ...stored,
                };

                if (!TESTING_RESET_ON_REFRESH) {
                    try {
                        const response =
                            await getMyCourseSubmissions(
                                targetSlug
                            );

                        const submissions =
                            getSubmissionsFromResponse(
                                response
                            );

                        const preferredSubmissions =
                            getPreferredSubmissions(
                                submissions
                            );

                        const {
                            statusMap,
                            submittedAtMap,
                            deadlineMap,
                            submissionIdMap,
                            reviewCommentMap,
                        } = buildSubmissionMaps(
                            preferredSubmissions
                        );

                        const merged = {
                            ...stored,
                            ...statusMap,
                        };

                        setTaskStatusMap(merged);
                        setSubmittedAtMap(
                            submittedAtMap
                        );
                        setDeadlineMap(
                            deadlineMap
                        );
                        setSubmissionIdMap(
                            submissionIdMap
                        );
                        setReviewCommentMap(
                            reviewCommentMap
                        );

                        saveTaskState(
                            user?._id || user?.id,
                            targetSlug,
                            merged
                        );

                        Object.assign(
                            latestMap,
                            merged
                        );
                    } catch (err) {
                        console.error(
                            "SUBMISSION STATE SYNC ERROR:",
                            err
                        );
                        console.error(
                            "SUBMISSION RESPONSE ERROR DATA:",
                            err?.response?.data
                        );
                        console.error(
                            "SUBMISSION RESPONSE STATUS:",
                            err?.response?.status
                        );
                        toast.error(
                            "Submission state could not be synced."
                        );
                    }
                }

                const firstAvailable = flatTasks.find((task) => {
                    const status = latestMap[task.id];

                    return (
                        status !== "approved" &&
                        status !== "expired"
                    );
                }) || flatTasks[0];

                return firstAvailable?.id || null;
            } catch (error) {
                console.error("❌ TASK DATA LOAD ERROR:", error);

                console.error(
                    "❌ API STATUS:",
                    error?.response?.status
                );

                console.error(
                    "❌ API DATA:",
                    error?.response?.data
                );

                console.error(
                    "❌ API URL:",
                    error?.config?.url
                );

                if (mounted) {
                    setError(
                        error?.response?.data?.message ||
                        error?.message ||
                        "Unable to load task data right now."
                    );
                }

                return null;
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };

        load().then((firstAvailable) => {
            if (
                mounted &&
                firstAvailable
            ) {
                setInitialTaskId(
                    firstAvailable
                );
            }
        });

        return () => {
            mounted = false;
        };

        // courseSlug intentionally controls reload.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [courseSlug, contentType]);

    return {
        courseSlug,
        setCourseSlug,
        courseTitle,
        studentName,
        modules,
        initialTaskId,
        loading,
        error,
        taskStatusMap,
        setTaskStatusMap,
        deadlineMap,
        setDeadlineMap,
        submissionIdMap,
        setSubmissionIdMap,
        submittedAtMap,
        setSubmittedAtMap,
        reviewCommentMap,
        setReviewCommentMap,
        applySubmissionState,
    };
};

export default useTaskData;