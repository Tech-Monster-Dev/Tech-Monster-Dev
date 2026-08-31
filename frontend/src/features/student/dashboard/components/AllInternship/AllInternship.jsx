import { motion } from "framer-motion";
import "./AllInternship.css";

import EmptyState from "../../../../../components/ui/EmptyState";
import CourseCard from "../CourseCard";


const AllInternship = ({ internships = [], refreshDashboard, onPreview }) => {
  const allCount = Array.isArray(internships) ? internships.length : 0;

  return (
    <section id="all-courses">

      <motion.div
        id="course-heading"
        initial={{ opacity: 0, x: -40 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
      >
        <h2>All Internships ({allCount})</h2>
        <p>Explore every available Internships</p>
      </motion.div>

      {allCount === 0 ? (
        <EmptyState
          heading="No Internships Yet"
          paragraph="You have not joined any Internship yet. Explore the available Internships below."
        />
      ) : (
        <div id="course-grid">
          {internships.map((internship, index) => (
            <CourseCard
              key={internship._id || internship.slug}
              index={index}
              internship={internship}
              type="internship"
              refreshDashboard={refreshDashboard}
            onPreview={onPreview}
            />
          ))}

        </div>
      )}

    </section>
  );
};

export default AllInternship;
