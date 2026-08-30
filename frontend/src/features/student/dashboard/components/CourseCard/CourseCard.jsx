import { motion } from "framer-motion";
import { Clock3, ArrowRight } from "lucide-react";
import "./CourseCard.css";
import defaultThumbnail from "../../../../../assets/thumnail/course_internship_default.svg";
import { toast } from 'react-toastify';
import { useNavigate } from "react-router-dom";

import api from "../../../../../services/api/axios";
import { API } from "../../../../../services/api/endpoints";

const CourseCard = ({ internship, refreshDashboard, index, type, setLoading }) => {
  const navigate = useNavigate();
  const isCourse = type === "course";
  const label = isCourse ? "Course" : "Internship";

  const handleJoin = async () => {
    try {
      setLoading(true);
      await api.post(isCourse ? API.COURSES.JOIN(internship._id) : API.INTERNSHIPS.JOIN(internship._id));

      await refreshDashboard?.();
      toast.success(`${label} joined successfully`);

    } catch (err) {
      toast.error(
        err.response?.data?.message ||
        `Unable to join ${label.toLowerCase()}`
      );

    } finally{
      setLoading(false);
    }
  };

  return (
    <motion.div
      id="allIntenrship-student-side-card"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: index * 0.2,
      }}
    >
      {/* Top Banner */}
      <div id="allIntenrship-student-side-card-banner">
        <img src={internship?.thumbnail || defaultThumbnail} alt={internship?.title} />
      </div>
      <div id="allIntenrship-student-side-card-banner-text" className={internship?.enrolled ? "enrolled" : ""}>
        {internship?.enrolled ? "Enrolled" : "New"}
      </div>

      {/* Title */}
      <div id="internships-info">
        <h3>{internship?.title}</h3>

        <p>{internship?.description}</p>
        <p>Level : <span>{internship?.level}</span></p>

        <div id="internships-meta">
          <p>
            Total Tasks : &nbsp;
            <span>{internship?.totalTasks}</span>
          </p>

          <p>
            Total Notes : &nbsp;
            <span>{internship?.totalNotes}</span>
          </p>

          <p>
            <Clock3 size={15} />
            <span> {internship?.duration}</span>
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.96 }}
          onClick={
            internship?.enrolled
              ? () =>
                navigate(
                  `/student/lessons/${type}/${internship.slug}`
                )
              : handleJoin
          }
        >
          {internship?.enrolled ? "Continue" : "Enroll Now"}
          <ArrowRight size={18} />
        </motion.button>
      </div>

    </motion.div>
  );
};

export default CourseCard;
