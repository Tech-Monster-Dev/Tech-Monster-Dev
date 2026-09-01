import "./Dashboard.css";

import { useState } from "react";
import { useNavigate } from "react-router-dom";

import ContinueLearning from "./components/ContinueLearning";
import AllInternship from "./components/AllInternship";
import AllCourses from "./components/AllCourses";
import LearningPreviewModal from "./components/LearningPreviewModal";
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

    const [preview, setPreview] = useState({
        open: false,
        item: null,
        type: "course",
    });

    const [warning, setWarning] = useState({
        open: false,
        mode: null,
    });

    const openPreview = (item, type) => {
        setPreview({
            open: true,
            item,
            type,
        });
    };

    const closePreview = () => {
        setPreview({
            open: false,
            item: null,
            type: "course",
        });
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

            <ContinueLearning
                learningItems={[
                    ...(dashboard?.internships || []).map(
                        (item) => ({
                            ...item,
                            type: "internship",
                        })
                    ),

                    ...(dashboard?.courses || []).map(
                        (item) => ({
                            ...item,
                            type: "course",
                        })
                    ),
                ]}
            />

            <AllCourses
                setLoading={setLoading}
                courses={
                    dashboard?.allCourses || []
                }
                refreshDashboard={loadDashboard}
                onPreview={openPreview}
            />

            <AllInternship
                internships={
                    dashboard?.allInternships || []
                }
                refreshDashboard={loadDashboard}
                onPreview={openPreview}
            />

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
