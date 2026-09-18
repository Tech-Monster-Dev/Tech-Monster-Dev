import "./InternshipRecommendation.css";
import defaultThumbnail from "../../../../../assets/thumnail/course_internship_default.svg";

import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import EmptyState from "../../../../../components/ui/EmptyState";
import DashButton from "../../../../../components/ui/Button/DashButton";

import {
  HiArrowRight,
  HiBookOpen,
  HiStar,
  HiPlayCircle,
} from "react-icons/hi2";

const InternshipRecommendation = ({
  internships = [],
}) => {
  const navigate = useNavigate();

  const handleContinue = (internship) => {
    const slug =
      internship?.slug ||
      internship?._id;

    if (!slug) return;
    navigate(`/student/lessons/${slug}`);
  };

  return (
    <motion.section
      className="internship-recommendation"
      initial={{
        opacity: 0,
        y: 80,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
      }}
      viewport={{
        once: true,
      }}
      transition={{
        duration: 0.7,
      }}
    >
      <div className="internship-header">
        <div>
          <h2>
            <HiBookOpen />
            Recommended Internships
          </h2>
          <p>
            Internships selected specially for you.
          </p>
        </div>

        <DashButton
          type="button"
          variant="outline"
          size="small"
          icon={<HiArrowRight />}
          iconPosition="right"
          className="view-btn"
          onClick={() => navigate("/student/dashboard")}
        >
          View All
        </DashButton>
      </div>

      {internships.length === 0 ? (
        <EmptyState
          compact
          heading="No Recommendations Yet"
          paragraph="Complete your profile to get personalized internship recommendations."
        />
      ) : (
        <div className="internship-slider">
          {internships.map(
            (internship, index) => (
              <motion.article
                key={
                  internship?._id ||
                  internship?.slug ||
                  index
                }
                className="internship-card"
                initial={{
                  opacity: 0,
                  y: 50,
                }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: index * 0.15,
                }}
                whileHover={{
                  y: -10,
                }}
              >
                <div className="internship-card-image">
                  <img
                    src={
                      internship?.thumbnail ||
                      defaultThumbnail
                    }
                    alt={
                      internship?.title ||
                      "Internship"
                    }
                    onError={(event) => {
                      event.currentTarget.src =
                        defaultThumbnail;
                    }}
                  />
                </div>

                <div className="internship-card-content">
                  <div className="internship-tags">
                    {internship?.category && (
                      <span>
                        {internship.category}
                      </span>
                    )}
                    {internship?.level && (
                      <span>
                        {internship.level}
                      </span>
                    )}
                  </div>

                  <h3>
                    {
                      internship?.title ||
                      "Untitled Internship"
                    }
                  </h3>

                  <div className="internship-meta">
                    <span>
                      <HiStar />
                      {internship?.rating || 0}
                    </span>
                    <span>
                      {internship?.totalNotes || 0}
                      {" "}
                      lessons
                    </span>
                  </div>

                  <DashButton
                    type="button"
                    variant="primary"
                    size="medium"
                    icon={<HiPlayCircle />}
                    iconPosition="left"
                    className="internship-continue-btn"
                    onClick={() => handleContinue(internship)}
                  >
                    Continue
                  </DashButton>
                </div>
              </motion.article>
            )
          )}
        </div>
      )}
    </motion.section>
  );
};

export default InternshipRecommendation;