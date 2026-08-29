import { useState, useEffect, useRef } from "react";
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

    // Sync input with URL change
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSearchTerm(queryParam);
    }, [queryParam]);

    // Close the dropdown when clicking outside the search container.
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

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

            setLoading(true);
            setShowDropdown(true);

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

    const handleClear = () => {
        setSearchTerm("");
        setCourses([]);
        setUsers([]);
        setSearched(false);
        setShowDropdown(false);
        if (location.pathname.includes("/student/home")) {
            navigate(`/student/home`, { replace: true });
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
        <div id="search-bar-container" ref={containerRef}>
            <FiSearch id="search-icon" />
            <input
                type="text"
                value={searchTerm}
                onChange={handleInputChange}
                onFocus={() => searchTerm.trim() && setShowDropdown(true)}
                placeholder="Search courses, users, categories..."
            />
            {searchTerm && (
                <button id="clear-search-btn" onClick={handleClear}>
                    <FiX />
                </button>
            )}

            {showDropdown && searchTerm.trim() && (
                <div id="search-results-dropdown">
                    {loading ? (
                        <div id="search-loading">Searching...</div>
                    ) : (
                        <>
                            {/* Courses / Internships */}
                            <div id="search-group">
                                <div id="search-group-title">
                                    <FiBookOpen /> Courses & Internships
                                </div>
                                {courses.length > 0 ? (
                                    courses.map((course) => (
                                        <div
                                            key={course._id}
                                            id="search-result-item"
                                            onClick={() => handleCourseClick(course)}
                                        >
                                            <FiBookOpen id="search-result-icon" />
                                            <div id="search-result-text">
                                                <span id="search-result-title">
                                                    {course.title}
                                                </span>
                                                <span id="search-result-sub">
                                                    {course.category || course.level || "Course"}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    searched && (
                                        <div id="search-empty">{COURSES_EMPTY_MSG}</div>
                                    )
                                )}
                            </div>

                            {/* Users */}
                            <div id="search-group">
                                <div id="search-group-title">
                                    <FiUser /> Users
                                </div>
                                {users.length > 0 ? (
                                    users.map((user) => (
                                        <div
                                            key={user._id}
                                            id="search-result-item"
                                            onClick={() => handleUserClick(user)}
                                        >
                                            <div id="search-result-avatar">
                                                <img
                                                src={user.avatar || defaultProfileImage}
                                                alt={user.username || "User"}
                                                onError={(event) => {
                                                    event.currentTarget.src = defaultProfileImage;
                                                }}
                                            />
                                            </div>
                                            <div id="search-result-text">
                                                <span id="search-result-title">
                                                    {user.firstName || user.lastName
                                                        ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
                                                        : user.username}
                                                </span>
                                                <span id="search-result-sub">
                                                    @{user.username}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    searched && (
                                        <div id="search-empty">{USERS_EMPTY_MSG}</div>
                                    )
                                )}
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}

export default SearchBar;
