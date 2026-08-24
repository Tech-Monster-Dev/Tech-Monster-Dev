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
    const [initialTaskId, setInitialTaskId] = useState(null);

    const applySubmissionState = useCallback(
        (submission) => {

            if (
                !submission?.moduleId ||
                !submission?.taskId
            ) {
                return;
            }

            const key =
                getTaskKey(
                    submission
                );

            console.log(
                "REALTIME SUBMISSION RECEIVED:",
                submission
            );

            console.log(
                "REALTIME TASK KEY:",
                key,
                "STATUS:",
                submission.status
            );

            if (!key) {
                return;
            }

            // ==============================
            // STATUS
            // ==============================

            setTaskStatusMap(
                (prev) => {

                    const next = {
                        ...prev,
                        [key]:
                            submission.status,
                    };

                    if (courseSlug) {
                        saveTaskState(
                            user?._id || user?.id,
                            courseSlug,
                            next
                        );
                    }

                    return next;
                }
            );

            // ==============================
            // SUBMITTED AT
            // ==============================

            if (
                submission.submittedAt
            ) {

                setSubmittedAtMap(
                    (prev) => ({
                        ...prev,

                        [key]:
                            submission.submittedAt,
                    })
                );
            }

            // ==============================
            // DEADLINE
            // ==============================

            setDeadlineMap(
                (prev) => ({

                    ...prev,

                    [key]: {

                        unlockedAt:
                            submission.unlockedAt ||
                            null,

                        expiresAt:
                            submission.expiresAt ||
                            null,

                        expiredAt:
                            submission.expiredAt ||
                            null,
                    },
                })
            );

            // ==============================
            // SUBMISSION ID
            // ==============================

            setSubmissionIdMap(
                (prev) => ({

                    ...prev,

                    [key]:
                        submission._id,
                })
            );
        },

        [
            courseSlug,
            user?._id,
            user?.id,
        ]

    );

    const resolveContentSlug = async () => {
        const type = String(contentType || "")
            .trim()
            .toLowerCase();

        if (!type) {
            return null;
        }

        const resource = getApiResource(type);

        try {
            const myRes = await api.get(
                `/${resource}/student/my`
            );

            const data = myRes?.data || {};

            const myList =
                Object.values(data).find(
                    (value) => Array.isArray(value)
                ) || [];

            const enrolledItem =
                myList.find(
                    (item) =>
                        item?.slug ||
                        item?.course?.slug ||
                        item?.internship?.slug
                );

            const enrolledSlug =
                enrolledItem?.slug ||
                enrolledItem?.course?.slug ||
                enrolledItem?.internship?.slug;

            if (enrolledSlug) {
                return normalizeSlug(enrolledSlug);
            }
        } catch (error) {
            console.warn(
                `Failed to load ${resource} enrollment:`,
                error
            );
        }

        try {
            const allRes = await api.get(
                `/${resource}`
            );

            const data = allRes?.data || {};

            const allList =
                Object.values(data).find(
                    (value) => Array.isArray(value)
                ) || [];

            const firstItem =
                allList.find(
                    (item) => item?.slug
                );

            const firstSlug =
                firstItem?.slug;

            return firstSlug
                ? normalizeSlug(firstSlug)
                : null;

        } catch (error) {
            console.warn(
                `Failed to load ${resource}:`,
                error
            );

            return null;
        }
    };

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
                    targetSlug = await resolveContentSlug();

                    if (mounted && targetSlug) {
                        setCourseSlug(targetSlug);
                    }
                }

                if (!targetSlug) {
                    if (mounted) {
                        setError(
                            "No internship found. Please enroll in a course first."
                        );

                        setLoading(false);
                    }

                    return;
                }

                // -----------------------------------------
                // COURSE DATA
                // -----------------------------------------

                const resource = getApiResource(contentType);

                const response = await api.get(
                    `/${resource}/slug/${targetSlug}`
                );

                const contentData = getContentFromResponse(response);

                if (!contentData) {
                    if (mounted) {
                        setError(
                            "Course content could not be loaded."
                        );

                        setLoading(false);
                    }

                    return;
                }

                if (!mounted) return;

                setCourseTitle(
                    contentData.title ||
                    contentType ||
                    "Content"
                );

                const builtModules = buildModules(contentData);
                console.log("Built Modules:=", builtModules);

                setModules(builtModules);
                console.log("Modules:=", modules);

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

                if (!TESTING_RESET_ON_REFRESH) {
                    try {
                        const subRes =
                            await getMyCourseSubmissions(
                                targetSlug
                            );

                        const submissions =
                            subRes?.data?.submissions || [];

                        if (submissions.length) {
                            const serverMap = {};
                            const timeMap = {};
                            const deadlineInfo = {};
                            const submissionIds = {};

                            // Prefer APPROVED submission for the same task.
                            // Otherwise keep the newest submission because
                            // backend returns submissions sorted newest first.
                            const preferredSubmissions = {};

                            submissions.forEach((submission) => {
                                const key =
                                    getTaskKey(submission);

                                if (!key) return;

                                const current =
                                    preferredSubmissions[key];

                                if (!current) {
                                    preferredSubmissions[key] =
                                        submission;
                                    return;
                                }

                                if (
                                    submission.status === "approved" &&
                                    current.status !== "approved"
                                ) {
                                    preferredSubmissions[key] =
                                        submission;
                                }
                            });

                            Object.values(
                                preferredSubmissions
                            ).forEach((submission) => {

                                const key =
                                    getTaskKey(submission);

                                serverMap[key] =
                                    submission.status;

                                if (submission.submittedAt) {
                                    timeMap[key] =
                                        submission.submittedAt;
                                }

                                deadlineInfo[key] = {
                                    unlockedAt:
                                        submission.unlockedAt ||
                                        null,

                                    expiresAt:
                                        submission.expiresAt ||
                                        null,

                                    expiredAt:
                                        submission.expiredAt ||
                                        null,
                                };

                                submissionIds[key] =
                                    submission._id;
                            });

                            const merged = {
                                ...stored,
                                ...serverMap,
                            };

                            setTaskStatusMap(merged);
                            setSubmittedAtMap(timeMap);
                            setDeadlineMap(deadlineInfo);
                            setSubmissionIdMap(
                                submissionIds
                            );

                            saveTaskState(
                                targetSlug,
                                merged
                            );
                        }
                    } catch (err) {
                        console.log("Submission Error 1:=", err);
                        toast.error("Subbmission Error 1")
                    }
                }

                // -----------------------------------------
                // SELECT FIRST AVAILABLE TASK
                // -----------------------------------------

                const flatTasks = builtModules.flatMap(
                    (module) => module.tasks
                );

                console.log("Flat Tasks:=", flatTasks);

                // =========================================
                // SERVER-AUTHORITATIVE TASK STATE
                // =========================================
                // IMPORTANT:
                // Do NOT use only local "stored" state here.
                // Backend submission status is the source of truth.
                // This also keeps unlockedAt/expiresAt available
                // after refresh without restarting the timer.

                const latestMap = {
                    ...stored,
                };

                if (!TESTING_RESET_ON_REFRESH) {
                    try {
                        const serverResponse =
                            await getMyCourseSubmissions(
                                targetSlug
                            );

                        const serverSubmissions =
                            serverResponse?.data?.submissions || [];

                        serverSubmissions.forEach((submission) => {
                            const key =
                                getTaskKey(submission);

                            if (!key) return;

                            latestMap[key] =
                                submission.status;

                            // Keep the server deadline in the same
                            // deadlineMap key used by TaskItem/TaskDeadlineCard.
                            setDeadlineMap((prev) => ({
                                ...prev,
                                [key]: {
                                    unlockedAt:
                                        submission.unlockedAt || null,

                                    expiresAt:
                                        submission.expiresAt || null,

                                    expiredAt:
                                        submission.expiredAt || null,
                                },
                            }));

                            if (submission.submittedAt) {
                                setSubmittedAtMap((prev) => ({
                                    ...prev,
                                    [key]:
                                        submission.submittedAt,
                                }));
                            }

                            if (submission._id) {
                                setSubmissionIdMap((prev) => ({
                                    ...prev,
                                    [key]:
                                        submission._id,
                                }));
                            }
                        });
                    } catch (err) {
                        console.log(
                            "Server state sync error:",
                            err
                        );
                    }
                }

                console.log(
                    "SERVER AUTHORITATIVE TASK MAP:",
                    latestMap
                );

                if (!TESTING_RESET_ON_REFRESH) {
                    try {
                        const subRes =
                            await getMyCourseSubmissions(
                                targetSlug
                            );

                        const preferredForAvailability = {};

                        (
                            subRes?.data?.submissions || []
                        ).forEach((submission) => {

                            const key =
                                getTaskKey(submission);

                            if (!key) return;

                            const current =
                                preferredForAvailability[key];

                            if (!current) {
                                preferredForAvailability[key] =
                                    submission;
                                return;
                            }

                            // APPROVED always wins.
                            if (
                                submission.status === "approved" &&
                                current.status !== "approved"
                            ) {
                                preferredForAvailability[key] =
                                    submission;
                            }
                        });

                        Object.values(
                            preferredForAvailability
                        ).forEach((submission) => {

                            const key =
                                getTaskKey(submission);

                            latestMap[key] =
                                submission.status;
                        });
                    } catch (err) {
                        console.log("Submission Error 2:=", err);
                        toast.error("Subbmission Error 2")
                    }
                }

                const firstAvailable =
                    flatTasks.find((task) => {
                        const status =
                            latestMap[task.id];

                        return (
                            status !== "approved" &&
                            status !== "expired"
                        );
                    }) || flatTasks[0];

                console.log("First Available:=", firstAvailable);
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
                console.log(
                    "INITIAL TASK ID SET TO:",
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
        applySubmissionState,
    };
};

export default useTaskData;