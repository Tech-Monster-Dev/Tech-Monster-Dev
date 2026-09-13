import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { useNavigate, useLocation } from "react-router-dom";
import { FiSearch, FiX, FiBookOpen, FiUser } from "react-icons/fi";
import defaultProfileImage from "../../../assets/profile/default-profile.svg";
import { searchInternships, searchUsers } from "../../../services/api/search.service";
import "./SearchBar.css";

const COURSES_EMPTY_MSG = "We couldn't find any courses or internships matching your search keywords on Tech Monster. Please try searching with a different keyword.";
const USERS_EMPTY_MSG = "User not found.";

function SearchBar() {
    const navigate = useNavigate();
    const location = useLocation();

    const searchParams = new URLSearchParams(location.search);
    const queryParam = searchParams.get("search") || "";

    const [searchTerm, setSearchTerm] = useState(queryParam);
    const [courses, setCourses] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [searched, setSearched] = useState(false);

    const containerRef = useRef(null);
    const debounceRef = useRef(null);

    const [dropdownStyle, setDropdownStyle] = useState({});

    // Sync input with URL change
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSearchTerm(queryParam);
    }, [queryParam]);

    // Close the dropdown when clicking outside the search container.
    const handleClear = useCallback(() => {
        setSearchTerm("");
        setCourses([]);
        setUsers([]);
        setSearched(false);
        setShowDropdown(false);

        if (location.pathname.includes("/student/home")) {
            navigate("/student/home", { replace: true });
        }
    }, [location.pathname, navigate]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            const searchContainer = containerRef.current;
            const resultsLayer = document.querySelector(".search-results-layer");

            const clickedInsideSearch = searchContainer?.contains(e.target);
            const clickedInsideResults = resultsLayer?.contains(e.target);

            if (!clickedInsideSearch && !clickedInsideResults) {
                handleClear();
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [handleClear]);

    useEffect(() => {
        if (!showDropdown || !containerRef.current) {
            return;
        }

        const updateDropdownPosition = () => {
            const rect = containerRef.current.getBoundingClientRect();

            setDropdownStyle({
                "--search-dropdown-left": `${rect.left}px`,
                "--search-dropdown-width": `${rect.width}px`,
                "--search-dropdown-top": `${rect.bottom}px`,
                "--search-overlay-top": `${rect.bottom}px`,
            });
        };

        updateDropdownPosition();

        const resizeObserver = new ResizeObserver(updateDropdownPosition);
        resizeObserver.observe(containerRef.current);

        window.addEventListener("resize", updateDropdownPosition);

        return () => {
            resizeObserver.disconnect();
            window.removeEventListener("resize", updateDropdownPosition);
        };
    }, [showDropdown]);

    useEffect(() => {
        if (!showDropdown) {
            return;
        }

        const html = document.documentElement;
        const body = document.body;
        const dashboardContent = document.querySelector(".dashboard-content");

        const previousHtmlOverflow = html.style.overflow;
        const previousBodyOverflow = body.style.overflow;
        const previousDashboardOverflow = dashboardContent?.style.overflowY;

        html.style.overflow = "hidden";
        body.style.overflow = "hidden";

        if (dashboardContent) {
            dashboardContent.style.overflowY = "hidden";
        }

        return () => {
            html.style.overflow = previousHtmlOverflow;
            body.style.overflow = previousBodyOverflow;

            if (dashboardContent) {
                dashboardContent.style.overflowY = previousDashboardOverflow;
            }
        };
    }, [showDropdown]);

    // Perform real search (courses + users) with debounce as the user types.
    // All setState calls happen inside the debounced callback (an external async
    // side effect), not synchronously in the effect body, to avoid cascades.
    useEffect(() => {
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        const term = searchTerm.trim();

        debounceRef.current = setTimeout(async () => {
            if (!term) {
                setCourses([]);
                setUsers([]);
                setSearched(false);
                setLoading(false);
                setShowDropdown(false);
                return;
            }

            setShowDropdown(true);
            setLoading(true);

            try {
                const [courseData, userData] = await Promise.all([
                    searchInternships(term),
                    searchUsers(term),
                ]);

                setCourses(courseData?.internships || []);
                setUsers(userData?.users || []);
                setSearched(true);
            } catch {
                setCourses([]);
                setUsers([]);
                setSearched(true);
            } finally {
                setLoading(false);
            }
        }, 350);

        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
        };
    }, [searchTerm]);

    const handleInputChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);

        // Keep the URL query in sync when on the home page.
        if (location.pathname.includes("/student/home")) {
            if (value.trim() !== "") {
                navigate(`/student/home?search=${encodeURIComponent(value)}`, { replace: true });
            } else {
                navigate(`/student/home`, { replace: true });
            }
        }
    };

    const handleCourseClick = (internship) => {
        setShowDropdown(false);
        navigate(`/student/lessons/${internship.slug || internship._id || "frontend-dev"}`);
    };

    const handleUserClick = (user) => {

        setShowDropdown(false);

        navigate(
            `/student/user-profile/${user?._id}`
        );
    };

    return (
        <div className="search-bar-container" ref={containerRef}>
            <FiSearch className="search-icon" />
            <input
                type="text"
                value={searchTerm}
                onChange={handleInputChange}
                onFocus={() => searchTerm.trim() && setShowDropdown(true)}
                placeholder="Search courses, users, categories..."
            />
            {searchTerm && (
                <button className="clear-search-btn" onClick={handleClear}>
                    <FiX />
                </button>
            )}

            {showDropdown && searchTerm.trim() && (
                <>
                    {createPortal(
                        <div
                            className="search-results-layer"
                            style={dropdownStyle}
                            onMouseDown={(e) => e.stopPropagation()}
                        >
                            <div
                                className="search-results-backdrop"
                                onMouseDown={handleClear}
                            />

                            <div
                                className="search-results-dropdown"
                                style={dropdownStyle}
                            >
                                {loading ? (
                                    <div className="search-loading">Searching...</div>
                                ) : (
                                    <>
                                        {/* Courses / Internships */}
                                        <div className="search-group">
                                            <div className="search-group-title">
                                                <FiBookOpen /> Courses & Internships
                                            </div>

                                            {courses.length > 0 ? (
                                                courses.map((course) => (
                                                    <div
                                                        key={course._id}
                                                        className="search-result-item"
                                                        onClick={() => handleCourseClick(course)}
                                                    >
                                                        <FiBookOpen className="search-result-icon" />

                                                        <div className="search-result-text">
                                                            <span className="search-result-title">
                                                                {course.title}
                                                            </span>

                                                            <span className="search-result-sub">
                                                                {course.category ||
                                                                    course.level ||
                                                                    "Course"}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                searched && (
                                                    <div className="search-empty">
                                                        {COURSES_EMPTY_MSG}
                                                    </div>
                                                )
                                            )}
                                        </div>

                                        {/* Users */}
                                        <div className="search-group">
                                            <div className="search-group-title">
                                                <FiUser /> Users
                                            </div>

                                            {users.length > 0 ? (
                                                users.map((user) => (
                                                    <div
                                                        key={user._id}
                                                        className="search-result-item"
                                                        onClick={() => handleUserClick(user)}
                                                    >
                                                        <div className="search-result-avatar">
                                                            <img
                                                                src={
                                                                    user.avatar ||
                                                                    defaultProfileImage
                                                                }
                                                                alt={
                                                                    user.username || "User"
                                                                }
                                                                onError={(event) => {
                                                                    event.currentTarget.src =
                                                                        defaultProfileImage;
                                                                }}
                                                            />
                                                        </div>

                                                        <div className="search-result-text">
                                                            <span className="search-result-title">
                                                                {user.firstName ||
                                                                    user.lastName
                                                                    ? `${user.firstName || ""} ${user.lastName || ""
                                                                        }`.trim()
                                                                    : user.username}
                                                            </span>

                                                            <span className="search-result-sub">
                                                                @{user.username}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                searched && (
                                                    <div className="search-empty">
                                                        {USERS_EMPTY_MSG}
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>,
                        document.body
                    )}
                </>
            )}
        </div>
    );
}

export default SearchBar;
