import "./feedback.css";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    FiMessageSquare,
    FiThumbsUp,
    FiThumbsDown,
    FiTrash2,
    FiStar,
    FiRefreshCw,
} from "react-icons/fi";

import SectionTabs from "../../../layouts/SectionTabs";
import Warning from "../../../components/ui/Warning/Warning";
import Spinner from "../../dashboard/common/LoaderPage/Spinner";

import {
    getAdminFeedback,
    deleteAdminFeedback,
} from "../../../services/api/feedback.service";


const FEEDBACK_TABS = [
    { value: "all", label: "All Feedback", icon: <FiMessageSquare /> },
    { value: "negative", label: "Negative Feedback", icon: <FiThumbsDown /> },
    { value: "positive", label: "Positive Feedback", icon: <FiThumbsUp /> },
];

const CATEGORY_LABELS = {
    website: "Website",
    course: "Course",
    internship: "Internship",
    bug: "Website Issue",
};

const getFullName = (student) => {
    const name = [
        student?.firstName,
        student?.middleName,
        student?.lastName,
    ].filter(Boolean).join(" ").trim();

    return name || student?.username || "Unknown Student";
};

const isNegativeFeedback = (feedback) =>
    feedback?.type === "bug" ||
    (Number(feedback?.rating) > 0 && Number(feedback.rating) <= 2);

const formatDate = (date) => {
    if (!date) return "Date unavailable";

    const parsedDate = new Date(date);

    return Number.isNaN(parsedDate.getTime())
        ? "Date unavailable"
        : parsedDate.toLocaleString("en-IN", {
            dateStyle: "medium",
            timeStyle: "short",
        });
};

export default function Feedback() {
    const [activeTab, setActiveTab] = useState(() => {
        const savedTab = localStorage.getItem("admin-feedback-active-tab");
        return ["all", "negative", "positive"].includes(savedTab) ? savedTab : "all";
    });
    const [feedbackList, setFeedbackList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedFeedback, setSelectedFeedback] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const deleteInFlightRef = useRef(false);
    const [deleteError, setDeleteError] = useState("");

    const fetchFeedback = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const response = await getAdminFeedback();
            const items = Array.isArray(response?.feedback)
                ? response.feedback
                : [];

            setFeedbackList(
                items.slice().sort(
                    (first, second) =>
                        new Date(second.createdAt || 0) -
                        new Date(first.createdAt || 0)
                )
            );
        } catch (err) {
            setError(
                err?.response?.data?.message ||
                "Unable to load feedback. Please try again."
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchFeedback();
        }, 0);

        return () => clearTimeout(timer);
    }, [fetchFeedback]);

    const filteredFeedback = useMemo(() => {
        if (activeTab === "negative") {
            return feedbackList.filter(isNegativeFeedback);
        }

        if (activeTab === "positive") {
            return feedbackList.filter(
                (feedback) =>
                    !isNegativeFeedback(feedback) &&
                    Number(feedback?.rating) >= 3
            );
        }

        return feedbackList;
    }, [activeTab, feedbackList]);

    const tabs = useMemo(
        () => FEEDBACK_TABS.map((tab) => ({
            ...tab,
            count: tab.value === "all"
                ? feedbackList.length
                : tab.value === "negative"
                    ? feedbackList.filter(isNegativeFeedback).length
                    : feedbackList.filter(
                        (feedback) =>
                            !isNegativeFeedback(feedback) &&
                            Number(feedback?.rating) >= 3
                    ).length,
        })),
        [feedbackList]
    );

    const handleDelete = async () => {
        if (!selectedFeedback?._id || deleteInFlightRef.current) return;

        deleteInFlightRef.current = true;
        setDeleting(true);
        setDeleteError("");

        try {
            await deleteAdminFeedback(selectedFeedback._id);

            setFeedbackList((current) =>
                current.filter(
                    (feedback) => feedback._id !== selectedFeedback._id
                )
            );

            setSelectedFeedback(null);
        } catch (err) {
            setDeleteError(
                err?.response?.data?.message ||
                "Unable to delete this feedback. Please try again."
            );
        } finally {
            deleteInFlightRef.current = false;
            setDeleting(false);
        }
    };

    return (
        <section className="admin-feedback-page">
            <header className="admin-feedback-header">
                <p className="admin-feedback-eyebrow">
                    ADMIN MANAGEMENT
                </p>

                <div className="admin-feedback-heading-row">
                    <div>
                        <h1>Feedback Management</h1>
                        <p>
                            Review student feedback, identify issues, and manage responses.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="admin-feedback-refresh"
                        onClick={fetchFeedback}
                        disabled={loading}
                        aria-label="Refresh feedback"
                        title="Refresh feedback"
                    >
                        <FiRefreshCw />
                        <span>Refresh</span>
                    </button>
                </div>

                <div className="admin-feedback-summary">
                    <div className="admin-feedback-summary-icon">
                        <FiMessageSquare />
                    </div>
                    <div>
                        <span>Total feedback</span>
                        <strong>{feedbackList.length}</strong>
                    </div>
                </div>
            </header>

            <SectionTabs
                tabs={tabs}
                activeTab={activeTab}
                onChange={(tab) => {
                    setActiveTab(tab);
                    localStorage.setItem("admin-feedback-active-tab", tab);
                }}
                className="admin-feedback-tabs"
            />

            <div className="admin-feedback-content">
                {loading ? (
                    <Spinner message="Loading feedback..." size={60} />
                ) : error ? (
                    <div className="admin-feedback-state admin-feedback-error">
                        <h2>Unable to load feedback</h2>
                        <p>{error}</p>
                        <button type="button" onClick={fetchFeedback}>
                            Try Again
                        </button>
                    </div>
                ) : filteredFeedback.length === 0 ? (
                    <div className="admin-feedback-state">
                        <div className="admin-feedback-empty-icon">
                            <FiMessageSquare />
                        </div>
                        <h2>
                            {activeTab === "negative"
                                ? "No Negative Feedback"
                                : activeTab === "positive"
                                    ? "No Positive Feedback"
                                    : "No Feedback Yet"}
                        </h2>
                        <p>
                            {activeTab === "all"
                                ? "Student feedback will appear here when it is submitted."
                                : "There are no feedback entries in this category yet."}
                        </p>
                    </div>
                ) : (
                    <div className="admin-feedback-list">
                        {filteredFeedback.map((feedback) => {
                            const student = feedback.student;
                            const negative = isNegativeFeedback(feedback);
                            const category = CATEGORY_LABELS[feedback.type] || "Feedback";
                            const avatar = student?.avatar;

                            return (
                                <article
                                    className="admin-feedback-card"
                                    key={feedback._id}
                                >
                                    <div className="admin-feedback-card-top">
                                        <div className="admin-feedback-author">
                                            {avatar ? (
                                                <img
                                                    className="admin-feedback-avatar"
                                                    src={avatar}
                                                    alt={`${getFullName(student)} profile`}
loading="lazy" decoding="async"
                                                    onError={(event) => {
                                                        event.currentTarget.style.display = "none";
                                                    }}
                                                />
                                            ) : (
                                                <div className="admin-feedback-avatar-fallback">
                                                    {getFullName(student).charAt(0).toUpperCase()}
                                                </div>
                                            )}

                                            <div className="admin-feedback-author-details">
                                                <strong>{getFullName(student)}</strong>
                                                <span>{student?.email || "Email unavailable"}</span>
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            className="admin-feedback-delete"
                                            onClick={() => {
                                                setDeleteError("");
                                                setSelectedFeedback(feedback);
                                            }}
                                            aria-label={`Delete feedback from ${getFullName(student)}`}
                                            title="Delete feedback"
                                        >
                                            <FiTrash2 />
                                        </button>
                                    </div>

                                    <div className="admin-feedback-meta">
                                        <span className="admin-feedback-category">
                                            {category}
                                        </span>

                                        <span
                                            className={`admin-feedback-sentiment ${
                                                negative
                                                    ? "is-negative"
                                                    : "is-positive"
                                            }`}
                                        >
                                            {negative ? (
                                                <FiThumbsDown />
                                            ) : (
                                                <FiThumbsUp />
                                            )}
                                            {negative ? "Negative" : "Positive"}
                                        </span>

                                        {Number(feedback.rating) > 0 && (
                                            <span className="admin-feedback-rating">
                                                <FiStar />
                                                {feedback.rating}/5
                                            </span>
                                        )}
                                    </div>

                                    <div className="admin-feedback-message">
                                        <h2>{feedback.subject || "Feedback"}</h2>
                                        <p>{feedback.message}</p>
                                    </div>

                                    {(feedback.course?.title ||
                                        feedback.internship?.title) && (
                                        <p className="admin-feedback-resource">
                                            <span>Resource:</span>{" "}
                                            {feedback.course?.title ||
                                                feedback.internship?.title}
                                        </p>
                                    )}

                                    <footer className="admin-feedback-card-footer">
                                        <span>{formatDate(feedback.createdAt)}</span>
                                        <span className="admin-feedback-id">
                                            ID: {feedback._id}
                                        </span>
                                    </footer>
                                </article>
                            );
                        })}
                    </div>
                )}
            </div>

            {deleteError && !selectedFeedback && (
                <p className="admin-feedback-delete-error" role="alert">
                    {deleteError}
                </p>
            )}

            <Warning
                open={Boolean(selectedFeedback)}
                title="Delete Feedback?"
                message={
                    deleteError ||
                    "Are you sure you want to permanently delete this feedback? This action cannot be undone."
                }
                confirmText={deleting ? "Deleting..." : "Delete Feedback"}
                cancelText="Cancel"
                onConfirm={handleDelete}
                onCancel={() => {
                    if (!deleting) {
                        setSelectedFeedback(null);
                        setDeleteError("");
                    }
                }}
            />
        </section>
    );
}
