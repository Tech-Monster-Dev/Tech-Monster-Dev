import './Sidebar.css';

import useAuth from '../../../../shared/hooks/useAuth';
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from 'react-toastify';
import Tooltip from '../../../../components/ui/Tooltip';
import Warning from '../../../../components/ui/Warning';


import SearchBar from "../../../../components/ui/SearchBar";
import Loader from "../../../../components/ui/Loader";
import api from "../../../../services/api/axios";
import { API } from "../../../../services/api/endpoints";

import {
    FiHome,
    FiGrid,
    FiCheckSquare,
    FiCalendar,
    FiUser,
    FiBookOpen,
    FiCreditCard,
    FiAward,
    FiSettings,
    FiLogOut,
    FiX,
    FiHelpCircle,
    FiBell,
    FiChevronLeft,
    FiMenu
} from "react-icons/fi";


function Sidebar({
    role = "student",
    collapsed = false,
    onToggleCollapse,
    mobileSidebarOpen = false,
    onCloseMobileSidebar,
    enrolledCourse
}) {

    const navigate = useNavigate();
    const location = useLocation();

    const [loading, setLoading] = useState(false);
    const [showDailyTaskWarning, setShowDailyTaskWarning] = useState(false);
    const [showLessonsWarning, setShowLessonsWarning] = useState(false);
    const activeLinkRef = useRef(null);
    useEffect(() => {
        activeLinkRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "center",
        });
    }, [location.pathname]);


    useEffect(() => {
        if (mobileSidebarOpen) {
            onCloseMobileSidebar?.();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.pathname]);

    const lessonPath = enrolledCourse?.type && enrolledCourse?.slug ? `/student/lessons/${enrolledCourse.type}/${enrolledCourse.slug}` : "/student/lessons";

    const studentLinks = [
        { name: "Home", path: "/student", icon: <FiHome /> },
        { name: "Dashboard", path: "/student/dashboard", icon: <FiGrid /> },

        {
            name: "Lessons",
            path: lessonPath,
            icon: <FiBookOpen />
        },

        {
            name: "Daily Task",
            path: "/student/tasks",
            icon: <FiCheckSquare />,
        },

        { name: "Attendance", path: "/student/attendance", icon: <FiCalendar /> },
        { name: "Badges", path: "/student/badges", icon: <FiAward /> },
        { name: "Account", path: "/student/account", icon: <FiUser /> },
        { name: "Certificate", path: "/student/certificate", icon: <FiAward /> },
        { name: "Feedback", path: "/student/feedback", icon: <FiHelpCircle /> },
        { name: "Help & Support", path: "/student/help&support", icon: <FiHelpCircle /> },
    ];

    const adminLinks = [
        { name: "Overview", path: "/admin", icon: <FiHome /> },
        { name: "Manage Students", path: "/admin/students", icon: <FiUser /> },
        { name: "Internships", path: "/admin/internships", icon: <FiBookOpen /> },
        { name: "Courses", path: "/admin/courses", icon: <FiBookOpen /> },
        { name: "Task Approval", path: "/admin/tasks", icon: <FiCheckSquare /> },
        { name: "Reports", path: "/admin/reports", icon: <FiGrid /> },
        { name: "Certificate Approval", path: "/admin/certificates", icon: <FiCreditCard /> },
        { name: "Support Inbox", path: "/admin/support", icon: <FiHelpCircle /> },
        { name: "Notice", path: "/admin/notice", icon: <FiBell /> },
    ];

    const navLinks = role === 'admin' ? adminLinks : studentLinks;

    const handleLinkClick = (e, link) => {
        if (role === "student" && link.name === "Daily Task") {
            e.preventDefault();
            setShowDailyTaskWarning(true);
            return;
        }

        if (role === "student" && link.name === "Lessons") {
            e.preventDefault();
            setShowLessonsWarning(true);
        }
    };

    const handleLessonsContinue = () => {
        setShowLessonsWarning(false);

        navigate("/student/dashboard", {
            state: {
                activeSection: "enrolled",
            },
        });

        onCloseMobileSidebar?.();
    };

    const handleDailyTaskContinue = async () => {
        try {
            setLoading(true);

            const { data } = await api.get(API.DASHBOARD.STUDENT);
            const dashboard = data?.dashboard || {};
            const enrolledItems = [
                ...(dashboard?.courses || []).map((item) => ({
                    ...item,
                    type: "course",
                })),
                ...(dashboard?.internships || []).map((item) => ({
                    ...item,
                    type: "internship",
                })),
            ];

            setShowDailyTaskWarning(false);

            if (enrolledItems.length === 1) {
                const item = enrolledItems[0];

                if (!item.slug) {
                    toast.error("Lesson could not be opened for this enrollment.");
                    return;
                }

                try {
                    localStorage.setItem(
                        "activeLearning",
                        JSON.stringify({
                            programId: item.type === "course"
                                ? item.courseId
                                : item.internshipId,
                            type: item.type,
                            slug: item.slug,
                            title: item.title,
                        })
                    );

                    window.dispatchEvent(new CustomEvent("activeLearningChanged"));
                } catch {
                    // Navigation can continue even if localStorage is unavailable.
                }

                navigate(`/student/lessons/${item.type}/${item.slug}`);
                onCloseMobileSidebar?.();
                return;
            }

            navigate("/student/dashboard", {
                state: {
                    activeSection: "enrolled",
                },
            });
            onCloseMobileSidebar?.();
        } catch (error) {
            console.error("Failed to load enrollments for Daily Task:", error);
            toast.error(
                error?.response?.data?.message ||
                "Unable to load your enrolled courses and internships."
            );
        } finally {
            setLoading(false);
        }
    };

    const { logout } = useAuth();

    const handleLogout = async () => {
        setLoading(true);

        try {
            await logout();
            sessionStorage.setItem("logoutSuccess", "true");
            navigate("/login", { replace: true });
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <Loader />
    }

    return (
        <>
            {/* ================= MOBILE OVERLAY ================= */}
            <AnimatePresence>
                {mobileSidebarOpen && (
                    <motion.div
                        className="mobile-sidebar-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        exit={{ opacity: 0 }}
                        onClick={onCloseMobileSidebar}
                    />
                )}
            </AnimatePresence>


            {/* ================= SIDEBAR ================= */}
            <motion.aside
                className={`dashboard-sidebar ${collapsed ? "collapsed" : ""
                    } ${mobileSidebarOpen ? "mobile-open" : ""
                    }`}
                initial={false}
                animate={{
                    x: 0
                }}
                transition={{
                    duration: 0.3,
                    ease: "easeInOut"
                }}
            >

                {/* ================= MOBILE HEADER ================= */}
                <div className="sidebar-header-mobile">

                    <h3>
                        Tech <span>Monster</span>
                    </h3>

                    <button
                        className="close-menu-btn"
                        onClick={onCloseMobileSidebar}
                        aria-label="Close menu"
                    >
                        <FiX />
                    </button>

                </div>


                {/* ================= MOBILE SEARCH ================= */}
                <div className="mobile-sidebar-search">
                    <SearchBar />
                </div>


                {/* ================= DESKTOP COLLAPSE ================= */}
                <Tooltip
                    label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                    <button
                        className="sidebar-collapse-btn"
                        onClick={() =>
                            onToggleCollapse && onToggleCollapse()
                        }
                        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                    >
                        {collapsed ? <FiMenu /> : <FiChevronLeft />}
                    </button>
                </Tooltip>


                {/* ================= MENU ================= */}
                <div className="sidebar-menu-scroll">
                    <ul className="sidebar-menubar">

                        {navLinks.map((link, index) => {

                            const isActive =
                                link.name === "Lessons"
                                    ? location.pathname.startsWith("/student/lessons")
                                    : link.name === "Daily Task"
                                        ? location.pathname.startsWith("/student/tasks")
                                        : location.pathname === link.path;

                            return (
                                <li
                                    key={index}
                                    ref={isActive ? activeLinkRef : null}
                                    className={isActive ? "active" : ""}
                                >
                                    <Tooltip
                                        label={link.name}
                                        disabled={!collapsed}
                                    >
                                        <Link
                                            to={link.path}
                                            state={
                                                (link.name === "Daily Task" || link.name === "Certificate") && enrolledCourse
                                                    ? {
                                                        programId: enrolledCourse.programId,
                                                        programType: enrolledCourse.type,
                                                        courseTitle: enrolledCourse.title,
                                                        courseSlug: enrolledCourse.slug,
                                                        type: enrolledCourse.type
                                                    }
                                                    : undefined
                                            }
                                            onClick={(e) => {
                                                handleLinkClick(e, link);
                                                onCloseMobileSidebar?.();
                                            }}
                                        >
                                            <span className="sidebar-link-icon">
                                                {link.linkIcon || link.icon}
                                            </span>

                                            {!collapsed && (
                                                <span className="sidebar-link-label">
                                                    {link.name}
                                                </span>
                                            )}

                                        </Link>
                                    </Tooltip>

                                </li>
                            );
                        })}

                    </ul>
                </div>


                {/* ================= FOOTER ================= */}
                <div className="sidebar-footer">

                    <Tooltip
                        label="Setting"
                        disabled={!collapsed}
                    >
                        <Link
                            to={`/${role}/settings`}
                            className={
                                location.pathname.includes("settings")
                                    ? "active"
                                    : ""
                            }
                            onClick={onCloseMobileSidebar}
                        >
                            <span className="sidebar-link-icon">
                                <FiSettings />
                            </span>

                            {!collapsed && (
                                <span className="sidebar-link-label">
                                    Setting
                                </span>
                            )}
                        </Link>
                    </Tooltip>


                    <Tooltip
                        label="Logout"
                        disabled={!collapsed}
                    >
                        <button
                            onClick={async () => {
                                await handleLogout();
                                onCloseMobileSidebar?.();
                            }}
                            className="logout-btn"
                        >
                            <span className="sidebar-link-icon">
                                <FiLogOut />
                            </span>

                            {!collapsed && (
                                <span className="sidebar-link-label">
                                    Logout
                                </span>
                            )}
                        </button>
                    </Tooltip>

                </div>

            </motion.aside>

            <Warning
                open={showLessonsWarning}
                title="Continue From Your Latest Lesson"
                message="Continue to your enrolled lessons and pick up from the lesson you completed most recently."
                confirmText="Continue"
                cancelText="Cancel"
                onConfirm={handleLessonsContinue}
                onCancel={() => {
                    setShowLessonsWarning(false);
                }}
            />

            <Warning
                open={showDailyTaskWarning}
                title="Open Daily Task From Lessons"
                message="Daily Task cannot be opened directly from the sidebar. Continue to your enrolled course or internship, then choose the task inside a lesson module."
                confirmText="Continue"
                cancelText="Cancel"
                onConfirm={handleDailyTaskContinue}
                onCancel={() => {
                    setShowDailyTaskWarning(false);
                }}
            />
        </>
    );
}

export default Sidebar;
