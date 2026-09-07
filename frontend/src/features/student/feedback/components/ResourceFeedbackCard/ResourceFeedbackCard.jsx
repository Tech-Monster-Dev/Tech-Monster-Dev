import defaultProfileImage from "../../../../../assets/profile/default-profile.svg";
import "./ResourceFeedbackCard.css";

const getStudentName = (student) =>
    [student?.firstName, student?.lastName].filter(Boolean).join(" ") ||
    student?.username ||
    "Student";

const getResourceTitle = (feedback) =>
    feedback?.course?.title || feedback?.internship?.title || "Resource";

const formatDate = (date) => {
    if (!date) return "Recently submitted";

    return new Date(date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

export default function ResourceFeedbackCard({ feedback }) {
    const student = feedback?.student;

    return (
        <article className="resource-feedback-card">
            <div className="resource-feedback-card-header">
                <div className="resource-feedback-author">
                    <img
                        src={
                            student?.avatar &&
                            student.avatar !== "/profile/default-profile.svg"
                                ? student.avatar
                                : defaultProfileImage
                        }
                        alt=""
                        onError={(event) => {
                            event.currentTarget.src = defaultProfileImage;
                        }}
                    />

                    <div>
                        <h3>{getStudentName(student)}</h3>
                        <span>@{student?.username || "student"}</span>
                    </div>
                </div>

                <time dateTime={feedback?.createdAt}>
                    {formatDate(feedback?.createdAt)}
                </time>
            </div>

            <div className="resource-feedback-card-resource">
                <span>{getResourceTitle(feedback)}</span>
            </div>

            <div className="resource-feedback-card-rating">
                <div className="resource-feedback-stars" aria-label={feedback?.rating + " out of 5 stars"}>{"★".repeat(feedback?.rating || 0)}{"☆".repeat(5 - (feedback?.rating || 0))}</div>
            </div>

            <h4>{feedback?.subject}</h4>
            <p>{feedback?.message}</p>
        </article>
    );
}
