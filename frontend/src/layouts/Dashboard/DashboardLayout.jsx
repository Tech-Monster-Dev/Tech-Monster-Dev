import "./DashboardLayout.css";

import { useEffect, useState } from "react";

import Navbar from "../../features/dashboard/common/Navbar";
import Sidebar from "../../features/dashboard/common/Sidebar";
import Footer from "../../features/dashboard/common/Footer";
import Main from "../../features/dashboard/common/Main";
import { socket } from "../../services/socket/socket";
import useAuth from "../../shared/hooks/useAuth";
import useActiveWebsiteTime from "../../shared/hooks/useActiveWebsiteTime";
import api from "../../services/api/axios";

function DashboardLayout({ role = "student" }) {

    const { user } = useAuth();

    const [collapsed, setCollapsed] = useState(false);
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    const [enrolledCourse, setEnrolledCourse] = useState(null);
    const [dailyTaskUnlocked, setDailyTaskUnlocked] = useState(false);
    const [allTasksCompleted, setAllTasksCompleted] = useState(false);
    const [activeWebsiteSeconds, setActiveWebsiteSeconds] = useState(0);
    const [activeTimeInitialized, setActiveTimeInitialized] = useState(false);

    const handleActiveWebsiteTime = (milliseconds) => {
        setActiveWebsiteSeconds(milliseconds);

        window.dispatchEvent(
            new CustomEvent("activeWebsiteTimeChanged", {
                detail: {
                    milliseconds
                }
            })
        );
    };

    useActiveWebsiteTime(
        role === "student" && Boolean(user) && activeTimeInitialized,
        handleActiveWebsiteTime,
        activeWebsiteSeconds
    );

    const enrolledCourseSlug = enrolledCourse?.slug;

    // LOAD TODAY ACTIVE TIME
    useEffect(() => {
        if (role !== "student" || user == null) {
            return;
        }

        const loadTodayActiveTime = async () => {
            try {
                const { data } = await api.get("/attendance/active-time");
                const seconds = data?.activeSeconds || 0;
                const milliseconds = seconds * 1000;
                setActiveWebsiteSeconds(milliseconds);
                setActiveTimeInitialized(true);

                window.dispatchEvent(
                    new CustomEvent("activeWebsiteTimeChanged", {
                        detail: { milliseconds }
                    })
                );
            } catch (error) {
                console.error("Failed to load today active time:", error);
                setActiveTimeInitialized(true);
            }
        };

        loadTodayActiveTime();
    }, [role, user]);


    // ==========================================
    // GET ACTIVE / ENROLLED LEARNING
    // ==========================================

    useEffect(() => {

        const loadActiveLearning = () => {

            try {
                const storedLearning = localStorage.getItem("activeLearning");

                if (storedLearning) {
                    const learning = JSON.parse(storedLearning);
                    setEnrolledCourse(learning);
                } else {
                    setEnrolledCourse(null);
                }

            } catch (error) {

                console.error(
                    "Failed to parse activeLearning:",
                    error
                );

                setEnrolledCourse(null);
            }
        };


        loadActiveLearning();

    }, []);


// ==========================================
// DAILY TASK ACCESS Locked or Unlocked
// ==========================================

    useEffect(() => {
        if (role !== "student" || !enrolledCourseSlug) {
            return;
        }

        const storageKey = `daily_task_unlocked_${enrolledCourse.slug}`;
        const storeValue = localStorage.getItem(storageKey);

        if (!storeValue) {
            localStorage.setItem(storageKey, "false");
        }

        const readDailyTaskAccess = () => {
            try {
                setDailyTaskUnlocked(localStorage.getItem(storageKey) === "true");
            } catch {
                setDailyTaskUnlocked(false);
            }
        };
        readDailyTaskAccess();

        const handleAccessChanged = (event) => {
            if (event.detail?.courseSlug === enrolledCourse.slug) {
                setDailyTaskUnlocked(Boolean(event.detail?.unlocked));
            }
        };

        window.addEventListener("dailyTaskAccessChanged", handleAccessChanged);
        window.addEventListener("storage", readDailyTaskAccess);

        return () => {
            window.removeEventListener("dailyTaskAccessChanged", handleAccessChanged);
            window.removeEventListener("storage", readDailyTaskAccess);
        };
    }, [role, enrolledCourseSlug, enrolledCourse?.slug]);

// ========================================================================================================


    // ==========================================
    // GLOBAL TASK APPROVAL REALTIME
    // Keeps Daily Task access synchronized even
    // when the student is on another page.
    // ==========================================
    useEffect(() => {
        if (role !== "student" || (!user?._id && !user?.id)
        ) {
            return;
        }

        const userId = String(user._id || user.id);

        const handleConnect = () => {
            socket.emit("join", userId);
        };

        const handleTaskApproved = ({
            submission,
            moduleCompleted,
            allTasksCompleted: courseCompleted,
        }) => {
            if (!submission) {
                return;
            }

            const activeLearning = enrolledCourse;

            if (!activeLearning?.slug || String(submission.courseSlug || "") !== String(activeLearning.slug)) {
                return;
            }

            // Every task approval is received here.
            // The final course completion signal is
            // maintained separately by the task lifecycle.
            if (courseCompleted) {
                try {
                    localStorage.setItem(
                        "all_tasks_completed",
                        "true"
                    );
                } catch {
                    // Ignore storage errors.
                }

                setAllTasksCompleted(true);
            }

            if (moduleCompleted) {
                try {
                    localStorage.setItem(
                        "daily_task_unlocked_" +
                        activeLearning.slug,
                        "false"
                    );
                } catch {
                    // Ignore storage errors.
                }

                setDailyTaskUnlocked(false);

                window.dispatchEvent(
                    new CustomEvent(
                        "dailyTaskAccessChanged",
                        {
                            detail: {
                                courseSlug:
                                    activeLearning.slug,
                                unlocked: false,
                                moduleId: null,
                            },
                        }
                    )
                );
            }
        };

        socket.on(
            "connect",
            handleConnect
        );

        socket.on(
            "taskApproved",
            handleTaskApproved
        );

        if (socket.connected) {
            socket.emit(
                "join",
                userId
            );
        } else {
            socket.connect();
        }

        return () => {
            socket.off(
                "connect",
                handleConnect
            );

            socket.off(
                "taskApproved",
                handleTaskApproved
            );
        };
    }, [
        role,
        user?._id,
        user?.id,
        enrolledCourse,
    ]);


    // ==========================================
    // SIDEBAR COLLAPSE
    // ==========================================

    const handleToggleCollapse = () => {

        setCollapsed((prev) => !prev);

    };


    // ==========================================
    // MOBILE SIDEBAR
    // ==========================================

    const handleOpenMobileSidebar = () => {

        setMobileSidebarOpen(true);

    };


    const handleCloseMobileSidebar = () => {

        setMobileSidebarOpen(false);

    };


    // ==========================================
    // COURSE COMPLETION
    // ==========================================

    const readAllTasksCompleted = () => {

        try {

            return (
                allTasksCompleted ||
                localStorage.getItem(
                    "all_tasks_completed"
                ) === "true"
            );

        } catch {

            return false;

        }
    };


    return (

        <div
            className={`dashboardContainer ${collapsed
                ? "sidebar-collapsed"
                : ""
                }`}
        >

            {/* ================= NAVBAR ================= */}

            <Navbar
                role={role}
                onMobileMenuClick={
                    handleOpenMobileSidebar
                }
            />




            <div id="sideMain">

                {/* ================= SIDEBAR ================= */}

                <Sidebar
                    role={role}
                    dailyTaskUnlocked={dailyTaskUnlocked}
                    isCourseCompleted={role === "student" ? readAllTasksCompleted() : false}
                    collapsed={collapsed}
                    onToggleCollapse={
                        handleToggleCollapse
                    }
                    mobileSidebarOpen={
                        mobileSidebarOpen
                    }
                    onCloseMobileSidebar={
                        handleCloseMobileSidebar
                    }
                    enrolledCourse={enrolledCourse}
                />


                {/* ================= MAIN ================= */}

                <Main />

            </div>


            {/* ================= FOOTER ================= */}

            <Footer />

        </div>

    );
}

export default DashboardLayout;