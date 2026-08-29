import { motion } from "framer-motion";
import "../AllInternship/AllInternship.css";

import EmptyState from '../../../../../components/ui/EmptyState';
import CourseCard from "../CourseCard";


const AllCourses = ({ courses = [], refreshDashboard, setLoading }) => {
  const allCount = Array.isArray(courses) ? courses.length : 0;

  return (
    <section id="all-courses">
      <motion.div
        id="course-heading"
        initial={{ opacity: 0, x: -40 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
      >
        <h2>All Courses ({allCount})</h2>
        <p>Explore every available course</p>
      </motion.div>

      {allCount === 0 ? (
        <EmptyState
          heading="No Courses Yet"
          paragraph="You have not joined any course yet. Explore the available learning programs below."
        />
      ) : (
        <div id="course-grid">
          {courses.map((course, index) => (

            <CourseCard
              setLoading={setLoading}
              key={course._id || course.slug}
              index={index}
              internship={course}
              type="course"
              refreshDashboard={refreshDashboard}
            />
          ))}

        </div>
      )}

    </section>
  );
};

export default AllCourses;
