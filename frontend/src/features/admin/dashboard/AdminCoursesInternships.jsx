import "./AdminCoursesInternships.css";

import { useCallback, useEffect, useMemo, useState } from "react";
import { FiBookOpen, FiBriefcase, FiUsers, FiPlus } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import SectionTabs from "../../../layouts/SectionTabs";
import LearningCard from "../../student/dashboard/components/LearningCard";

import EmptyState from "../../../components/ui/EmptyState";
import DashButton from "../../../components/ui/Button/DashButton";
import AdminLearningDetailsModal from "./components/AdminLearningDetailsModal";
import EnrolledStudentsModal from "./components/EnrolledStudentsModal";
import AdminCoursesInternshipsSkeleton from "./components/AdminCoursesInternshipsSkeleton";

import useSkeletonScrollLock from "../../../shared/hooks/useSkeletonScrollLock";

import { getAllCourses } from "../../../services/api/course.service";
import { getAllInternships } from "../../../services/api/internship.service";
import api from "../../../services/api/axios";

export default function AdminCoursesInternships() {
    const [activeTab, setActiveTab] = useState("enrolled");
    const [courses, setCourses] = useState([]);
    const [internships, setInternships] = useState([]);
    const [enrolledCourses, setEnrolledCourses] = useState([]);
    const [enrolledInternships, setEnrolledInternships] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const [selectedProgram, setSelectedProgram] = useState(null);
    const [selectedEnrolledProgram, setSelectedEnrolledProgram] = useState(null);

    const fetchPrograms = useCallback(async () => {
        try {
            setLoading(true);

            const [
                coursesResponse,
                internshipsResponse,
                enrolledResponse,
            ] = await Promise.all([
                getAllCourses(),
                getAllInternships(),
                api.get("/admin/enrollments"),
            ]);

            setCourses(coursesResponse.data?.courses || []);
            setInternships(internshipsResponse.data?.internships || []);
            setEnrolledCourses(enrolledResponse.data?.courses || []);
            setEnrolledInternships(
                enrolledResponse.data?.internships || []
            );
        } catch (error) {
            console.error(
                "Failed to load courses and internships:",
                error
            );

            toast.error(
                "Failed to load courses and internships"
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        queueMicrotask(fetchPrograms);
    }, [fetchPrograms]);

    useEffect(() => {
        if (loading || selectedProgram) {
            return;
        }

        const saved = JSON.parse(
            sessionStorage.getItem("adminLearningModal") || "null"
        );

        if (!saved?.id || !saved?.type) {
            return;
        }

        const items = saved.type === "course" ? courses : internships;
        const item = items.find(
            (program) => String(program._id) === String(saved.id)
        );

        if (item) {
            queueMicrotask(() => {
                setActiveTab(saved.tab || (saved.type === "internship" ? "internships" : "courses"));
                setSelectedProgram({ item, type: saved.type });
            });
        } else {
            sessionStorage.removeItem("adminLearningModal");
        }
    }, [loading, courses, internships, selectedProgram]);

    useSkeletonScrollLock(loading);

    const currentItems = useMemo(() => {
        if (activeTab === "courses") {
            return courses;
        }

        if (activeTab === "internships") {
            return internships;
        }

        return [
            ...enrolledCourses.map((item) => ({
                ...item,
                enrolledStudents: item.students || [],
                programType: "course",
            })),
            ...enrolledInternships.map((item) => ({
                ...item,
                enrolledStudents: item.students || [],
                programType: "internship",
            })),
        ];
    }, [
        activeTab,
        courses,
        internships,
        enrolledCourses,
        enrolledInternships,
    ]);

    if (loading) {
        return <AdminCoursesInternshipsSkeleton />;
    }

    const handleCardClick = (item) => {
        if (activeTab === "enrolled") {
            setSelectedEnrolledProgram(item);
            return;
        }

        const type = activeTab === "internships"
            ? "internship"
            : "course";

        setSelectedProgram({ item, type });

        sessionStorage.setItem(
            "adminLearningModal",
            JSON.stringify({
                id: item._id,
                type,
                tab: activeTab,
            })
        );
    };

    const handleCloseDetails = () => {
        setSelectedProgram(null);
        sessionStorage.removeItem("adminLearningModal");
    };

    const handleCloseEnrolledStudents = () => {
        setSelectedEnrolledProgram(null);
    };

    const tabs = [
        {
            label: "Enrolled",
            value: "enrolled",
            icon: <FiUsers />,
            count: enrolledCourses.length + enrolledInternships.length,
        },
        {
            label: "Courses",
            value: "courses",
            icon: <FiBookOpen />,
            count: courses.length,
        },
        {
            label: "Internships",
            value: "internships",
            icon: <FiBriefcase />,
            count: internships.length,
        },
    ];

    return (
        <section className="adminLearningPage">
            <header className="adminLearningHeader">
                <div>
                    <span className="adminLearningEyebrow">
                        Learning Management
                    </span>

                    <h1>Courses & Internships</h1>

                    <p>
                        Manage learning programs, enrolled students,
                        and program details from one place.
                    </p>
                </div>

                <div className="adminLearningAddActions">
                    <DashButton
                        variant="secondary"
                        size="medium"
                        icon={<FiPlus />}
                        iconPosition="left"
                        className="adminLearningAddButton"
                        onClick={() => navigate("/admin/course-form")}
                    >
                        Add Course
                    </DashButton>

                    <DashButton
                        variant="secondary"
                        size="medium"
                        icon={<FiPlus />}
                        iconPosition="left"
                        className="adminLearningAddButton"
                        onClick={() => navigate("/admin/internships-form")}
                    >
                        Add Internship
                    </DashButton>
                </div>
            </header>

            <SectionTabs
                tabs={tabs}
                activeTab={activeTab}
                onChange={setActiveTab}
            />

            {!loading && currentItems.length === 0 ? (
                <EmptyState
                    heading={
                        activeTab === "enrolled"
                            ? "No Enrolled Programs"
                            : activeTab === "courses"
                                ? "No Courses Yet"
                                : "No Internships Yet"
                    }
                    paragraph={
                        activeTab === "enrolled"
                            ? "No course or internship has enrolled students yet."
                            : activeTab === "courses"
                                ? "There are no courses available right now."
                                : "There are no internships available right now."
                    }
                />
            ) : (
                <div className="adminLearningGrid">
                    {currentItems.map((item, index) => (
                        <LearningCard
                            key={`${item.programType || activeTab}-${item._id}`}
                            item={item}
                            type={
                                item.programType ||
                                (activeTab === "internships"
                                    ? "internship"
                                    : "course")
                            }
                            index={index}
                            badge={
                                activeTab === "enrolled"
                                    ? `${item.enrolledStudents?.length || 0} ${
                                          item.enrolledStudents?.length === 1
                                              ? "Student"
                                              : "Students"
                                      }`
                                    : ""
                            }
                            showBadge={activeTab === "enrolled"}
                            hint={
                                activeTab === "enrolled"
                                    ? "View enrolled students"
                                    : "View program details"
                            }
                            onClick={() => handleCardClick(item)}
                        />
                    ))}
                </div>
            )}

            <AdminLearningDetailsModal
                open={Boolean(selectedProgram)}
                item={selectedProgram?.item}
                type={selectedProgram?.type}
                onClose={handleCloseDetails}
                onRefresh={fetchPrograms}
            />

            <EnrolledStudentsModal
                open={Boolean(selectedEnrolledProgram)}
                item={selectedEnrolledProgram}
                type={selectedEnrolledProgram?.programType}
                students={
                    selectedEnrolledProgram?.enrolledStudents || []
                }
                onClose={handleCloseEnrolledStudents}
            />
        </section>
    );
}