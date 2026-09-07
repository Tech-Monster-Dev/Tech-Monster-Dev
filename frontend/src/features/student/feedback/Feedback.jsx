import { useState } from "react";
import SectionTabs from "../../../layouts/SectionTabs";
import FeedbackLoading from "./components/FeedbackLoading";
import FeedbackForm from "./components/FeedbackForm";
import ResourceFeedbackCard from "./components/ResourceFeedbackCard";
import useFeedbackData from "./hooks/useFeedbackData";
import { FEEDBACK_TABS } from "./constants/feedback.constants";
import "./Feedback.css";

export default function Feedback() {
    const [activeTab, setActiveTab] = useState("website");
    const {
        courses,
        internships,
        websiteFeedback,
        courseFeedback,
        internshipFeedback,
        loading,
        reloadFeedback,
    } = useFeedbackData();

    if (loading) {
        return <FeedbackLoading />;
    }

    return (
        <section className="feedback-page">
            <div className="feedback-page-header">
                <p className="feedback-page-eyebrow">Your Voice Matters</p>
                <h1>Feedback</h1>
                <p>
                    Share your experience, help us improve, and report anything
                    that needs our attention.
                </p>
            </div>

            <SectionTabs
                tabs={FEEDBACK_TABS}
                activeTab={activeTab}
                onChange={setActiveTab}
            />

            <div className="feedback-page-content">
                <div className="feedback-tab-content">
                    {activeTab === "website" && (
                        <WebsiteFeedbackTab
                            feedback={websiteFeedback}
                            onSubmitted={reloadFeedback}
                        />
                    )}

                    {activeTab === "course" && (
                        <CourseFeedbackTab
                            courses={courses}
                            feedback={courseFeedback}
                        />
                    )}

                    {activeTab === "internship" && (
                        <InternshipFeedbackTab
                            internships={internships}
                            feedback={internshipFeedback}
                        />
                    )}

                    {activeTab === "bug" && <BugFeedbackTab />}
                </div>
            </div>
        </section>
    );
}

function WebsiteFeedbackTab({ feedback, onSubmitted }) {
    return (
        <FeedbackForm
            type="website"
            title="Website Feedback"
            description="Tell us how the website works for you and share any experience, suggestion, or problem you have noticed."
            feedback={feedback}
            onSubmitted={onSubmitted}
        />
    );
}

function CourseFeedbackTab({ courses, feedback }) {
    return (
        <ResourceFeedbackTab
            type="course"
            resources={courses}
            feedback={feedback}
            title="Course Feedback"
            emptyMessage="You do not have any enrolled courses available for feedback."
        />
    );
}

function InternshipFeedbackTab({ internships, feedback }) {
    return (
        <ResourceFeedbackTab
            type="internship"
            resources={internships}
            feedback={feedback}
            title="Internship Feedback"
            emptyMessage="You do not have any internships available for feedback."
        />
    );
}

function ResourceFeedbackTab({ type, resources, feedback = [], title, emptyMessage }) {
    return (
        <div className="feedback-resource-section">
            <div className="feedback-form-heading">
                <h2>{title}</h2>
                <p>
                    Select a resource and share your genuine experience with
                    our team.
                </p>
            </div>

            {!resources.length && (
                <p className="feedback-empty">{emptyMessage}</p>
            )}

            {resources.length > 0 && (
                <FeedbackForm
                    type={type}
                    resources={resources}
                    title={title}
                />
            )}

            {feedback.length > 0 && (
                <div className="feedback-resource-list">
                    {feedback.slice(0, 5).map((item) => (
                        <ResourceFeedbackCard
                            key={item._id}
                            feedback={item}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

function BugFeedbackTab() {
    return (
        <FeedbackForm
            type="bug"
            title="Website Bug / Issue Feedback"
            description="Report a website problem or issue so our team can investigate and improve your experience."
        />
    );
}
