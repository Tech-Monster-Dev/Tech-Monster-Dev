import "./DashboardLayout.css";

import { useEffect, useState } from "react";

import Navbar from "../../features/dashboard/common/Navbar";
import Sidebar from "../../features/dashboard/common/Sidebar";
import Main from "../../features/dashboard/common/Main";
import Footer from "../../features/dashboard/common/Footer";

import useAuth from "../../shared/hooks/useAuth";
import useActiveWebsiteTime from "../../shared/hooks/useActiveWebsiteTime";
import api from "../../services/api/axios";

function DashboardLayout({ role = "student" }) {

    const { user } = useAuth();

    const [collapsed, setCollapsed] = useState(false);
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    const [enrolledCourse, setEnrolledCourse] = useState(null);
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

        window.addEventListener("activeLearningChanged", loadActiveLearning);

        return () => {
            window.removeEventListener("activeLearningChanged", loadActiveLearning);
        };

    }, []);

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

    return (

        <div
            className={`dashboardContainer ${collapsed ? "sidebar-collapsed" : ""}`}
        >
            {/* ================= NAVBAR ================= */}
            <Navbar
                role={role}
                onMobileMenuClick={
                    handleOpenMobileSidebar
                }
            />

            <div className="sidebar-main">
                {/* ================= SIDEBAR ================= */}
                <Sidebar
                    role={role}
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
