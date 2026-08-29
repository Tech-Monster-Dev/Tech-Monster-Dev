import { motion } from 'framer-motion';
import EmptyState from '../../../components/ui/EmptyState';

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.4 }
  })
};

export default function ProfileCards({
  internships = [],
  courses = [],
  certificates = [],
  badges = []
}) {
  return (
    <div className="cards-grid">
      {/* Internships Card */}
      <motion.div custom={0} variants={cardVariants} initial="hidden" animate="visible" className="profile-card-glass">
        <h3 className="card-title">💼 Internships ({internships.length})</h3>
        <div className="card-list">
          {internships.length > 0 ? (
            internships.map((item, idx) => (
              <div key={idx} className="item-badge">
                <p className="item-title">
                  {item.title}
                </p>

                <span className="item-sub">
                  {item.category || item.level || "Internship"}
                </span>

                <span className="item-sub">
                  Progress: {item.progress || 0}%
                </span>
              </div>
            ))
          ) : (
            <EmptyState
              compact
              heading="No Active Internships"
              paragraph="You are not enrolled in any active internships yet."
            />
          )}
        </div>
      </motion.div>

      {/* Enrolled Courses Card */}
      <motion.div custom={1} variants={cardVariants} initial="hidden" animate="visible" className="profile-card-glass">
        <h3 className="card-title">📚 Courses ({courses.length})</h3>
        <div className="card-list">
          {courses.length > 0 ? (
            courses.map((item, idx) => (
              <div key={idx} className="item-badge">
                <p className="item-title">
                  {item.title}
                </p>

                <span className="item-sub">
                  {item.category || item.level || "Course"}
                </span>

                <span className="item-sub">
                  Progress: {item.progress || 0}%
                </span>
              </div>
            ))
          ) : (
            <EmptyState
              compact
              heading="No Courses Enrolled"
              paragraph="You have not enrolled in any courses yet."
            />
          )}
        </div>
      </motion.div>

      {/* Certificates Card */}

      <motion.div
        custom={2}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className="profile-card-glass"
      >
        <h3 className="card-title">
          🏆 Certificates ({certificates.length})
        </h3>

        <div className="card-list">

          {certificates.length > 0 ? (

            certificates.map((item) => (

              <div
                key={item._id}
                className="item-badge"
              >

                <p className="item-title">
                  {item.internship?.title ||
                    "Internship Certificate"}
                </p>

                <span className="item-sub">
                  Certificate No:{" "}
                  {item.certificateNumber}
                </span>

                <span className="item-sub">
                  Issued:{" "}
                  {item.issueDate
                    ? new Date(
                      item.issueDate
                    ).toLocaleDateString()
                    : "N/A"}
                </span>

              </div>

            ))

          ) : (

            <EmptyState
              compact
              heading="No Certificates Yet"
              paragraph="You have not earned any certificates yet."
            />

          )}

        </div>
      </motion.div>

      <motion.div
        custom={3}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className="profile-card-glass"
      >
        <h3 className="card-title">
          🥇 Badges ({badges.length})
        </h3>

        <div className="card-list">

          {badges.length > 0 ? (

            badges.map((item) => (

              <div
                key={item._id}
                className="item-badge"
              >

                <p className="item-title">
                  {item.badge?.name ||
                    "Achievement Badge"}
                </p>

                <span className="item-sub">
                  Earned:{" "}
                  {item.earnedAt
                    ? new Date(
                      item.earnedAt
                    ).toLocaleDateString()
                    : "N/A"}
                </span>

              </div>

            ))

          ) : (

            <EmptyState
              compact
              heading="No Badges Yet"
              paragraph="You have not earned any badges yet."
            />

          )}

        </div>

      </motion.div>
    </div>
  );
}