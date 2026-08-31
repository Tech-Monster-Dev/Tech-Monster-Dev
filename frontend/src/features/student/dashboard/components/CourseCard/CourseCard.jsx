import { motion } from "framer-motion";
import { Clock3, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

import "./CourseCard.css";

const CourseCard = ({
    internship,
    refreshDashboard,
    index = 0,
    type = "course",
    setLoading,
    onPreview,
}) => {
    const navigate = useNavigate();

    const isCourse = type === "course";
    const label = isCourse ? "Course" : "Internship";

    const handleJoin = async () => {
        if (typeof onPreview === "function") {
            onPreview(internship, type);
            return;
        }

        if (internship?.enrolled) {
            navigate(
                `/student/lessons/${type}/${internship.slug}`
            );
        }
    };
return (
        <motion.div
            id="allIntenrship-student-side-card"
            initial={{
                opacity: 0,
                y: 40,
            }}
            animate={{
                opacity: 1,
                y: 0,
            }}
            transition={{
                duration: 0.4,
                delay: index * 0.08,
            }}
            whileHover={{
                y: -5,
            }}
        >
<div
                id="allIntenrship-student-side-card-banner-text"
                className={
                    internship?.enrolled
                        ? "enrolled"
                        : ""
                }
            >
                {internship?.enrolled
                    ? "Enrolled"
                    : "New"}
            </div>

            <div
                id="internships-info"
                onClick={handleJoin}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                    if (
                        event.key === "Enter" ||
                        event.key === " "
                    ) {
                        event.preventDefault();
                        handleJoin();
                    }
                }}
            >
                <h3>
                    {internship?.title}
                </h3>

                <p>
                    {internship?.description}
                </p>

                <p>
                    Level :{" "}
                    <span>
                        {internship?.level}
                    </span>
                </p>

                <div id="internships-meta">
                    <p>
                        Total Tasks : &nbsp;
                        <span>
                            {internship?.totalTasks || 0}
                        </span>
                    </p>

                    <p>
                        Total Notes : &nbsp;
                        <span>
                            {internship?.totalNotes || 0}
                        </span>
                    </p>

                    <p>
                        <Clock3 size={15} />
                        <span>
                            {internship?.duration ||
                                "Duration unavailable"}
                        </span>
                    </p>
                </div>

                <div className="student-learning-card-hint">
                    Tap to know more information
                </div>

                <motion.button
                    type="button"
                    whileHover={{
                        scale: 1.05,
                    }}
                    whileTap={{
                        scale: 0.96,
                    }}
                    onClick={(event) => {
                        event.stopPropagation();

                        if (internship?.enrolled) {
                            navigate(
                                `/student/lessons/${type}/${internship.slug}`
                            );
                            return;
                        }

                        handleJoin();
                    }}
                >
                    {internship?.enrolled
                        ? "Continue"
                        : "Enroll Now"}

                    <ArrowRight size={18} />
                </motion.button>
            </div>
        </motion.div>
    );
};

export default CourseCard;
