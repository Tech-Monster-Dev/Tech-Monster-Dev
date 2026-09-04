import "./Dashboard.css";

import { useState } from "react";
import { useNavigate } from "react-router-dom";

import AllInternship from "./components/AllInternship";
import AllCourses from "./components/AllCourses";
import LearningPreviewModal from "./components/LearningPreviewModal";
import EmptyState from "../../../components/ui/EmptyState";
import LearningCard from "./components/LearningCard";
import SectionTabs from "../../../layouts/SectionTabs";
import Warning from "../../../components/ui/Warning";

import DashboardSkeleton from "./DashboardSkeleton";

import useDashboardData from "./hooks/useDashboardData";

function Dashboard() {
    const navigate = useNavigate();

    const { 
        dashboard,
        loading, 
        setLoading, 
        loadDashboard,
        api,
        toast,
        API
    } = useDashboardData();

    const [preview, setPreview] = useState(() => {
        try {
            const savedPreview = localStorage.getItem("tech-monster-learning-preview");

            if (!savedPreview) {
                return {
                    open: false,
                    item: null,
                    type: "course",
                };
            }

            const parsedPreview = JSON.parse(savedPreview);

            if (parsedPreview?.open && parsedPreview?.item) {
                return {
                    open: true,
                    item: parsedPreview.item,
                    type: parsedPreview.type === "internship" ? "internship" : "course",
                };
            }
        } catch {
            localStorage.removeItem("tech-monster-learning-preview");
        }

        return {
            open: false,
            item: null,
            type: "course",
        };
    });

    const [activeSection, setActiveSection] = useState("enrolled");

    const [warning, setWarning] = useState({
        open: false,
        mode: null,
    });

    const openPreview = (item, type) => {
        const nextPreview = {
            open: true,
            item,
            type,
        };

        setPreview(nextPreview);
        localStorage.setItem(
            "tech-monster-learning-preview",
            JSON.stringify(nextPreview)
        );
    };

    const closePreview = () => {
        setPreview({
            open: false,
            item: null,
            type: "course",
        });

        localStorage.removeItem("tech-monster-learning-preview");
    };

    const handleEnroll = async () => {
        const item = preview.item;
        const type = preview.type;

        if (!item) {
            return;
        }

        if (item.enrolled) {
            closePreview();

            navigate(
                `/student/lessons/${type}/${item.slug}`
            );

            return;
        }

        if (!dashboard?.user?.profileCompleted) {
            setWarning({
                open: true,
                mode: "profile-incomplete",
            });

            return;
        }

        setWarning({
            open: true,
            mode: "enrollment-confirm",
        });
    };

    const handleConfirm = async () => {
        const item = preview.item;
        const type = preview.type;

        if (!item?._id) {
            toast.error("Learning item not found.");
            return;
        }

        try {
            setLoading(true);

            const endpoint =
                type === "course"
                    ? API.COURSES.JOIN(item._id)
                    : API.INTERNSHIPS.JOIN(item._id);

            await api.post(endpoint);

            setWarning({
                open: false,
                mode: null,
            });

            closePreview();

            toast.success(
                type === "course"
                    ? "Course enrolled successfully."
                    : "Internship enrolled successfully."
            );

            await loadDashboard();

        } catch (err) {
            console.error("Enrollment failed:", err);

            toast.error(
                err?.response?.data?.message ||
                "Unable to complete enrollment."
            );

        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return <DashboardSkeleton />;
    }

    return (
        <div className="dashboard-page">

            <SectionTabs
                tabs={[
                    { label: "Enrolled", value: "enrolled" },
                    { label: "Courses", value: "courses" },
                    { label: "Internships", value: "internships" },
                ]}
                activeTab={activeSection}
                onChange={setActiveSection}
            />

            {activeSection === "enrolled" && (
                <div className="learning-card-grid">
                    {(dashboard?.courses || []).map((course, index) => (
                        <LearningCard
                            key={course._id || course.slug}
                            item={{ ...course, enrolled: true }}
                            type="course"
                            index={index}
                            badge="Enrolled"
                            hint="Continue your enrolled course"
                            showProgress
                            onClick={openPreview}
                        />
                    ))}

                    {(dashboard?.internships || []).map((internship, index) => (
                        <LearningCard
                            key={internship._id || internship.slug}
                            item={{ ...internship, enrolled: true }}
                            type="internship"
                            index={(dashboard?.courses || []).length + index}
                            badge="Enrolled"
                            hint="Continue your enrolled internship"
                            showProgress
                            onClick={openPreview}
                        />
                    ))}

                    {(dashboard?.courses || []).length === 0 &&
                        (dashboard?.internships || []).length === 0 && (
                            <EmptyState
                                heading="No Learning Content Yet"
                                paragraph="You have not enrolled in any course or internship yet."
                            />
                        )}
                </div>
            )}

            {activeSection === "courses" && (
                <AllCourses
                    setLoading={setLoading}
                    courses={dashboard?.allCourses || []}
                    refreshDashboard={loadDashboard}
                    onPreview={openPreview}
                />
            )}

            {activeSection === "internships" && (
                <AllInternship
                    internships={dashboard?.allInternships || []}
                    refreshDashboard={loadDashboard}
                    onPreview={openPreview}
                />
            )}

            <LearningPreviewModal
                open={preview.open}
                item={preview.item}
                type={preview.type}
                onCancel={closePreview}
                onEnroll={handleEnroll}
            />

            <Warning
                open={warning.open && warning.mode === "profile-incomplete"}
                title="Complete Your Profile"
                message="You need to complete your account profile first. Please complete your profile before enrolling in a course or internship."
                confirmText="Go to Account"
                cancelText="Cancel"
                onConfirm={() => {
                    setWarning({ open: false, mode: null });
                    navigate("/student/account");
                }}
                onCancel={() => {
                    setWarning({ open: false, mode: null });
                }}
            />

            <Warning
                open={warning.open && warning.mode === "enrollment-confirm"}
                title="Confirm Enrollment"
                message={
                    <>
                        <strong>
                            Thank you for completing your profile.
                        </strong>
                        <br />
                        Are you sure you want to enroll in this{" "}
                        {preview.type === "course"
                            ? "course"
                            : "internship"}?
                        Once enrolled, this action cannot be cancelled.
                        <br />
                        <br />
                        <a href="/privacy-policy">
                            Privacy Policy
                        </a>
                        {" · "}
                        <a href="/terms-and-conditions">
                            Terms &amp; Conditions
                        </a>
                    </>
                }
                confirmText="Confirm"
                cancelText="Cancel"
                onConfirm={handleConfirm}
                onCancel={() => {
                    setWarning({
                        open: false,
                        mode: null,
                    });
                }}
            />
        </div>
    );
}

export default Dashboard;
