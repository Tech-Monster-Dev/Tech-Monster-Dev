import "./InternshipRecommendation.css";
const defaultThumbnail = "/assets/thumnail/course_internship_default.svg";

import { useRouter } from "next/navigation";
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
  const router = useRouter();

  const handleContinue = (internship) => {
    if (internship?._id == null && internship?.slug == null) return;

    const preview = {
      open: true,
      item: internship,
      type: "internship",
    };

    localStorage.setItem(
      "tech-monster-learning-preview",
      JSON.stringify(preview)
    );

    sessionStorage.setItem("tech-monster-navigation-state", JSON.stringify({ activeSection: "internships" }));
    router.push("/student/dashboard?section=internships");
  };

  return (
    <section
      className="internship-recommendation"
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
          onClick={() => router.push("/student/dashboard?section=internships")}
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
              <article
                key={
                  internship?._id ||
                  internship?.slug ||
                  index
                }
                className="internship-card"
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
              </article>
            )
          )}
        </div>
      )}
    </section>
  );
};

export default InternshipRecommendation;
