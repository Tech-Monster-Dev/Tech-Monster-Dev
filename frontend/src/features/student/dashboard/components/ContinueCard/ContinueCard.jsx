import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

import "./ContinueCard.css";
const defaultThumbnail = "/assets/thumnail/course_internship_default.svg";

const ContinueCard = ({ learning }) => {

  const router = useRouter();

  const {
    type,
    title,
    thumbnail,
    progress = 0,
    remainingTasks = 0,
    remainingNotes = 0,
    slug
  } = learning || {};

  const isCourse = type === "course";

  const learningLabel = isCourse ? "Course" : "Internship";

  const handleContinue = () => {

    if (!slug || !type) {
      console.error(
        "Invalid learning item:",
        learning
      );
      return;
    }

    // Save currently selected course/internship
    localStorage.setItem("activeLearning", JSON.stringify({programId: isCourse ? learning?.courseId : learning?.internshipId, type, slug, title}));
    window.dispatchEvent(new CustomEvent("activeLearningChanged"));

    router.push(`/student/lessons/${type}/${slug}`);
  };

  return (
    <motion.div
      className="continue-card"
      initial={{
        opacity: 0,
        y: 20
      }}
      animate={{
        opacity: 1,
        y: 0
      }}
      transition={{
        duration: 0.2,
        ease: "easeInOut"
      }}
    >

      <div className="continue-card-bg">
        <img
          src={thumbnail || defaultThumbnail}
          alt={title}
        />
      </div>

      <div className="continue-card-type">
        {learningLabel}
      </div>

      <h3>
        {title}
      </h3>

      <span>
        {progress}% Completed
      </span>

      <div className="progress">

        <motion.div
          className="progress-fill"
          initial={{
            width: 0
          }}
          animate={{
            width: `${progress}%`
          }}
          transition={{
            duration: 0.8
          }}
        />

      </div>

      <div className="continue-card-content">

        <small>
          {remainingTasks} Tasks Left
        </small>

        <small>
          {remainingNotes} Lessons Left
        </small>

      </div>

      <button
        type="button"
        onClick={handleContinue}
      >
        Continue
        <ArrowRight size={18} />
      </button>

    </motion.div>
  );
};

export default ContinueCard;