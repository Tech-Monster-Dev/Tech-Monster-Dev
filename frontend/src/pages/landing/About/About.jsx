import './About.css';
import { aboutData } from './AboutData';

import { motion } from 'framer-motion';
import AboutImage from '../../../assets/illustrations/About.png';
import { FaBullseye, FaLightbulb, FaBookOpen, FaUsers, FaShieldAlt } from "react-icons/fa";

import Card from "../../../components/ui/Card";


function About() {

  return (
    <>
      <section className="section" data-section="about">
        <div className="about-page">
          <div className="about-container">
            <motion.div className='about-image' initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: .8 }}>
              <img src={AboutImage} alt="About" />
            </motion.div>

            <motion.div className="about-content" initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: .8 }}>
              <span className="about-badge">
                {aboutData.badge}
              </span>

              <h2>{aboutData.title}</h2>
              <p>{aboutData.description}</p>

              <div className="mission">
                <FaBullseye />
                <div>
                  <h3>Mission</h3>
                  <p>{aboutData.mission}</p>
                </div>
              </div>

              <div className="vision">
                <h3>Vision</h3>
                <p>{aboutData.vision}</p>
              </div>
            </motion.div>
          </div>

          <div className="values">
            {aboutData.values.map((value) => (
              <motion.div key={value.id} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: value * .2 }}>
                <Card className="value-card">

                  {value.title === "Innovation" && <FaLightbulb />}
                  {value.title === "Learning" && <FaBookOpen />}
                  {value.title === "Team Work" && <FaUsers />}
                  {value.title === "Integrity" && <FaShieldAlt />}

                  <h3>{value.title}</h3>
                  <p>{value.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  )

}

export default About;