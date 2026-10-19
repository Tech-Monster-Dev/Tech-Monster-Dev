import Rating from "../../../../../components/ui/Form/component/Rating";
import Card from "../../../../../components/ui/Card";
const defaultProfileImage = "/assets/profile/default-profile.svg";
import { FaQuoteLeft } from "react-icons/fa";

function FeedbackCard({ feedback }) {
    const student = feedback?.student;

    const studentName = [
        student?.firstName,
        student?.lastName
    ]
        .filter(Boolean)
        .join(" ") || student?.username || "Student";

    const avatar = student?.avatar &&
        student.avatar !== "/assets/profile/default-profile.svg"
        ? student.avatar
        : defaultProfileImage;

    return (
        <Card className="feedback-card">
            <FaQuoteLeft className="feedback-quote" />

            <Rating rating={feedback?.rating || 0} />

            <h3>{feedback?.subject}</h3>

            <p className="feedback-message">
                {feedback?.message}
            </p>

            <div className="feedback-student">
                <img
                    src={avatar}
                    alt={`${studentName} profile`}
                    className="feedback-student-avatar"
                    onError={(event) => {
                        event.currentTarget.onerror = null;
                            event.currentTarget.src = defaultProfileImage;
                    }}
                />

                <span className="feedback-student-name">
                    {studentName}
                </span>
            </div>
        </Card>
    );
}

export default FeedbackCard;
