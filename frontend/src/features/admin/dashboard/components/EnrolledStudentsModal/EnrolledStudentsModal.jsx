import "./EnrolledStudentsModal.css";

import { motion } from "framer-motion";
import {
    FiCalendar,
    FiMail,
    FiUsers,
    FiX,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";

import defaultProfileImage from "../../../../../assets/profile/default-profile.svg";

const getStudentName = (student) => {
    const fullName = [
        student?.firstName,
        student?.middleName,
        student?.lastName,
    ]
        .filter(Boolean)
        .join(" ")
        .trim();

    return fullName || student?.username || "Unknown Student";
};

const formatEnrollmentDate = (date) => {
    if (!date) {
        return "Date unavailable";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
        return "Date unavailable";
    }

    return new Intl.DateTimeFormat("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    }).format(parsedDate);
};

const EnrolledStudentsModal = ({
    open = false,
    item = null,
    type = "course",
    students = [],
    onClose,
}) => {
    const navigate = useNavigate();

    if (!open || !item) {
        return null;
    }

    const label =
        type === "internship"
            ? "Internship"
            : "Course";

    const handleOverlayMouseDown = (event) => {
        if (event.target === event.currentTarget) {
            onClose?.();
        }
    };

    const handleStudentClick = (student) => {
        if (!student?._id) {
            return;
        }

        onClose?.();
        navigate(`/admin/students/${student._id}`);
    };

    return (
        <motion.div
            className="enrolledStudentsOverlay"
            role="dialog"
            aria-modal="true"
            aria-labelledby="enrolled-students-title"
            onMouseDown={handleOverlayMouseDown}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <motion.div
                className="enrolledStudentsModal"
                initial={{
                    opacity: 0,
                    y: 24,
                    scale: 0.98,
                }}
                animate={{
                    opacity: 1,
                    y: 0,
                    scale: 1,
                }}
                exit={{
                    opacity: 0,
                    y: 24,
                    scale: 0.98,
                }}
                transition={{ duration: 0.25 }}
                onMouseDown={(event) => {
                    event.stopPropagation();
                }}
            >
                <button
                    type="button"
                    className="enrolledStudentsClose"
                    onClick={onClose}
                    aria-label="Close"
                    title="Close"
                >
                    <FiX />
                </button>

                <div className="enrolledStudentsContent">
                    <header className="enrolledStudentsHeader">
                        <span className="enrolledStudentsEyebrow">
                            {label} · Enrolled Students
                        </span>

                        <h2 id="enrolled-students-title">
                            {item.title || "Untitled Program"}
                        </h2>

                        <p>
                            Students currently enrolled in this{" "}
                            {label.toLowerCase()}.
                        </p>

                        <div className="enrolledStudentsCount">
                            <FiUsers />
                            <span>
                                {students.length}{" "}
                                {students.length === 1
                                    ? "Student"
                                    : "Students"}
                            </span>
                        </div>
                    </header>

                    {students.length === 0 ? (
                        <div className="enrolledStudentsEmpty">
                            <FiUsers />
                            <h3>No enrolled students</h3>
                            <p>
                                There are no students enrolled in this
                                program yet.
                            </p>
                        </div>
                    ) : (
                        <div className="enrolledStudentsList">
                            {students.map((student, index) => (
                                <motion.button
                                    key={
                                        student.enrollmentId ||
                                        student._id ||
                                        index
                                    }
                                    type="button"
                                    className="enrolledStudentItem"
                                    onClick={() =>
                                        handleStudentClick(student)
                                    }
                                    whileHover={{ y: -2 }}
                                    whileTap={{ scale: 0.99 }}
                                >
                                    <img
                                        src={
                                            student.avatar &&
                                            student.avatar !==
                                                "/profile/default-profile.svg"
                                                ? student.avatar
                                                : defaultProfileImage
                                        }
                                        alt=""
                                        onError={(event) => {
                                            event.currentTarget.src =
                                                defaultProfileImage;
                                        }}
                                    />

                                    <div className="enrolledStudentInfo">
                                        <strong>
                                            {getStudentName(student)}
                                        </strong>

                                        <span>
                                            @{student.username || "student"}
                                        </span>

                                        <span className="enrolledStudentEmail">
                                            <FiMail />
                                            {student.email ||
                                                "Email unavailable"}
                                        </span>
                                    </div>

                                    <div className="enrolledStudentDate">
                                        <span>
                                            <FiCalendar />
                                            Enrolled
                                        </span>

                                        <strong>
                                            {formatEnrollmentDate(
                                                student.startedAt
                                            )}
                                        </strong>
                                    </div>
                                </motion.button>
                            ))}
                        </div>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
};

export default EnrolledStudentsModal;
