import './Navbar.css';

import useAuth from '../../../../shared/hooks/useAuth';
import defaultProfileImg from '../../../../assets/profile/default-profile.svg';

import { useState } from "react";
import { Link, useNavigate, NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    FiUser,
    FiLogOut,
    FiBell,
    FiMessageSquare,
    FiMenu,
} from "react-icons/fi";
import logo from "../../../../assets/logo/logo.webp";
import SystemBar from '../../../../components/common/navbar/SystemBar';
import SearchBar from '../../../../components/ui/SearchBar';
import Loader from "../../../../components/ui/Loader";

import useNotification from "../../../../shared/hooks/useNotification";

function Navbar({ role = "student", onMobileMenuClick }) {

    const { logout, user } = useAuth();
    const {
        notifications,
        unreadCount,
        markAsRead
    } = useNotification();

    const userName = user?.username || '';
    const capitalName = userName.toUpperCase() || userName;

    const [loading, setLoading] = useState(false);
    const [showNotificationPopup, setShowNotificationPopup] = useState(false);
    const [showProfilePopup, setShowProfilePopup] = useState(false);

    // Resolve the profile image URL: support `profilePic` or `avatar` fields.
    // If neither is a valid image URL, fall back to the FiUser placeholder.
    const profileImg = user?.avatar &&
        user.avatar !== "/profile/default-profile.svg"
        ? user.avatar
        : defaultProfileImg;


    const navigate = useNavigate();

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
        return <Loader />;
    }

    return (
        <>
            <nav className='navDash'>
                <SystemBar user={capitalName} />

                <header className="dashboard-navbar">
                    <div className="dashboard-navbar-left-section">
                        <button
                            className="dashboard-navbar-menu-toggle-btn"
                            onClick={onMobileMenuClick}
                            aria-label="Open menu"
                        >
                            <FiMenu />
                        </button>

                        {/* Logo placed in Navbar */}
                        <div className="dashboard-navbar-logo">
                            <img src={logo} alt="Logo" />
                            <h2>Tech <span>Monster</span></h2>
                        </div>
                    </div>

                    <div className="dashboard-navbar-search">
                        <SearchBar />
                    </div>

                    {/* Right Icons & User Profile */}
                    <div className="dashboard-navbar-right">

                        {/* Notification Bell with Dropdown & Badge Counter */}
                        <div
                            className="dashboard-navbar-notification-wrapper"
                            onMouseEnter={() =>
                                setShowNotificationPopup(true)
                            }
                            onMouseLeave={() =>
                                setShowNotificationPopup(false)
                            }
                        >

                            <NavLink
                                to={`/${role}/notification`}
                                className={({ isActive }) =>
                                    isActive
                                        ? "dashboard-navbar-notification-btn active"
                                        : "dashboard-navbar-notification-btn"
                                }
                            >

                                <FiBell />

                                {unreadCount > 0 && (

                                    <motion.span
                                        className="dashboard-navbar-notification-badge"
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{
                                            type: "spring",
                                            stiffness: 500
                                        }}
                                    >
                                        {unreadCount > 99
                                            ? "99+"
                                            : unreadCount
                                        }
                                    </motion.span>
                                )}
                            </NavLink>

                            <AnimatePresence>
                                {showNotificationPopup && (
                                    <motion.div
                                        className="dashboard-navbar-notification-dropdown"
                                        initial={{
                                            opacity: 0,
                                            y: 0,
                                            scale: 0.95
                                        }}

                                        animate={{
                                            opacity: 1,
                                            y: 0,
                                            scale: 1
                                        }}

                                        exit={{
                                            opacity: 0,
                                            y: 0,
                                            scale: 0.95
                                        }}

                                        transition={{
                                            duration: 0.2
                                        }}
                                    >

                                        <div className="dashboard-navbar-notif-header">

                                            <span>
                                                Notifications
                                            </span>

                                            <span
                                                style={{
                                                    fontSize: "11px",
                                                    color: "#00f0ff"
                                                }}
                                            >
                                                {unreadCount} New
                                            </span>

                                        </div>


                                        <div className="dashboard-navbar-notif-list">
                                            {notifications.length === 0 ? (
                                                <div className="dashboard-navbar-notif-item">
                                                    No notifications
                                                </div>
                                            ) : (

                                                notifications
                                                    .slice(0, 5)
                                                    .map((item) => (

                                                        <div
                                                            key={item._id}

                                                            className={
                                                                `dashboard-navbar-notif-item ${!item.isRead
                                                                    ? "unread"
                                                                    : ""
                                                                }`
                                                            }

                                                            onClick={() =>
                                                                markAsRead(
                                                                    item._id
                                                                )
                                                            }
                                                        >

                                                            <strong>
                                                                {item.title}
                                                            </strong>

                                                            <p>
                                                                {item.message}
                                                            </p>

                                                            <small>
                                                                {new Date(
                                                                    item.createdAt
                                                                ).toLocaleString()}
                                                            </small>

                                                        </div>

                                                    ))

                                            )}

                                        </div>


                                        <div className="dashboard-navbar-notif-footer">

                                            <Link
                                                to={`/${role}/notification`}
                                            >
                                                View All Notifications →
                                            </Link>

                                        </div>

                                    </motion.div>

                                )}

                            </AnimatePresence>

                        </div>

                        <NavLink to={`/${role}/message`} className={({ isActive }) => isActive ? 'dashboard-navbar-message-btn active' : 'dashboard-navbar-message-btn'}>
                            <FiMessageSquare />
                        </NavLink>

                        <div className="dashboard-navbar-verticalLine"></div>

                        {/* User Profile with Hover Popup */}
                        <div
                            className="dashboard-navbar-user-profile-wrapper"
                            onMouseEnter={() => setShowProfilePopup(true)}
                            onMouseLeave={() => setShowProfilePopup(false)}
                        >
                            <div className="dashboard-navbar-user-profile">
                                <div className="dashboard-navbar-avatar-circle">
                                    {profileImg ? (
                                        <img
                                            src={profileImg}
                                            alt={userName || "User"}
                                            className="dashboard-navbar-user-profile-img"
                                        />
                                    ) : (
                                        <img src={defaultProfileImg} alt="defaultProfile" />
                                    )}
                                </div>
                                <span className="dashboard-navbar-username">{userName || 'username'}</span>
                            </div>

                            <AnimatePresence>
                                {showProfilePopup && (
                                    <motion.div
                                        className="dashboard-navbar-profile-popup"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <Link to={`/${role}/account`} className="dashboard-navbar-popup-item">
                                            <FiUser /> Profile
                                        </Link>
                                        <button onClick={handleLogout} className="dashboard-navbar-popup-item logout">
                                            <FiLogOut /> Logout
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </header>
            </nav>
        </>
    )
}

export default Navbar;