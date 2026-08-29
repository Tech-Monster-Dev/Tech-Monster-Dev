import './Sidebar.css';

import useAuth from '../../../../shared/hooks/useAuth';
import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from 'react-toastify';


import SearchBar from "../../../../components/ui/SearchBar";
import Loader from "../../../../components/ui/Loader";

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
    FiLock,
    FiHelpCircle,
    FiChevronLeft,
    FiMenu
} from "react-icons/fi";


function Sidebar({
    role = "student",
    isCourseCompleted = false,
    dailyTaskUnlocked = false,
    collapsed = false,
    onToggleCollapse,
    mobileSidebarOpen = false,
    onCloseMobileSidebar,
    enrolledCourse
}) {

    const navigate = useNavigate();
    const location = useLocation();

    const [loading, setLoading] = useState(false);

    const dailyTaskLocked = role === "student" && (!enrolledCourse || !dailyTaskUnlocked);

    useEffect(() => {
        if (mobileSidebarOpen) {
            onCloseMobileSidebar?.();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.pathname]);

    const lessonPath = enrolledCourse?.type && enrolledCourse?.slug ? `/student/lessons/${enrolledCourse.type}/${enrolledCourse.slug}` : "/student/lessons";

    const taskPath = enrolledCourse?.type && enrolledCourse?.slug
            ? `/student/tasks/${enrolledCourse.type}/${enrolledCourse.slug}`
            : `/student/tasks/`;

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
            path: taskPath,
            icon: <FiCheckSquare />,
            locked: dailyTaskLocked && !isCourseCompleted,
        },

        { name: "Attendance", path: "/student/attendance", icon: <FiCalendar /> },
        { name: "Badges", path: "/student/badges", icon: <FiAward /> },
        { name: "Account", path: "/student/account", icon: <FiUser /> },
        { name: "Certificate", path: "/student/certificate", icon: <FiAward />, locked: !isCourseCompleted },
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
    ];

    const navLinks = role === 'admin' ? adminLinks : studentLinks;

    const handleLinkClick = (e, link) => {
        if (!link.locked) {
            return;
        }

        e.preventDefault();

        if (link.name === "Certificate") {
            toast.warning(
                "Complete all internship tasks to unlock your certificate!"
            );
            return;
        }

        if (link.name === "Daily Task") {
            toast.warning(
                "Complete the previous module tasks to unlock Daily Task!"
            );
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
                <button
                    id="sidebar-collapse-btn"
                    onClick={() =>
                        onToggleCollapse && onToggleCollapse()
                    }
                    title={
                        collapsed
                            ? "Expand sidebar"
                            : "Collapse sidebar"
                    }
                >
                    {collapsed ? <FiMenu /> : <FiChevronLeft />}
                </button>


                {/* ================= MENU ================= */}
                <ul className="sidebar-menu">

                    {navLinks.map((link, index) => {

                        const isActive =
                            link.name === "Lessons"
                                ? location.pathname.startsWith("/student/lessons")
                                : location.pathname === link.path;

                        return (
                            <li
                                key={index}
                                className={`
                                ${isActive ? "active" : ""}
                                ${link.locked ? "locked-link" : ""}
                            `}
                            >

                                <Link
                                    to={link.locked ? "#" : link.path}
                                    state={
                                        link.name === "Daily Task" && enrolledCourse
                                            ? {
                                                courseSlug: enrolledCourse.slug,
                                                type: enrolledCourse.type
                                            }
                                            : undefined
                                    }
                                    onClick={(e) => {

                                        handleLinkClick(e, link);

                                        if (!link.locked) {
                                            onCloseMobileSidebar?.();
                                        }

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

                                    {link.locked && !collapsed && (
                                        <FiLock className="lock-icon-right" />
                                    )}

                                    {collapsed && (
                                        <span className="sidebar-tooltip">
                                            {link.name}
                                        </span>
                                    )}

                                </Link>

                            </li>
                        );
                    })}

                </ul>


                {/* ================= FOOTER ================= */}
                <div className="sidebar-footer">

                    <Link
                        to={`/${role}/settings`}
                        className={
                            location.pathname.includes("settings")
                                ? "active"
                                : ""
                        }
                        title={collapsed ? "Setting" : undefined}
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

                        {collapsed && (
                            <span className="sidebar-tooltip">
                                Setting
                            </span>
                        )}

                    </Link>


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

                        {collapsed && (
                            <span className="sidebar-tooltip">
                                Logout
                            </span>
                        )}

                    </button>

                </div>

            </motion.aside>
        </>
    );
}

export default Sidebar;
