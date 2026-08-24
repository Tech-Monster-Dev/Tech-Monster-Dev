import { motion } from "framer-motion";

import {
    FiCode,
} from "react-icons/fi";

import {
    fadeUp,
    staggerContainer,
    cardAnimation,
    viewport,
} from "../../../../shared/animations/motionVariants";


const TechStack = () => {

    const technologies = [
        "HTML",
        "CSS",
        "JavaScript",
        "React",
        "Node.js",
        "Express",
        "MongoDB",
        "Git",
        "GitHub",
        "REST API",
    ];


    return (

        <section className="tech-stack-section">

            <motion.div
                className="learn-section-heading center"

                variants={fadeUp}

                initial="hidden"
                whileInView="visible"

                viewport={viewport}
            >

                <span className="learn-section-label">

                    <FiCode />

                    TECHNOLOGY

                </span>


                <h2>

                    Build With

                    <span>
                        {" "}Modern Tech.
                    </span>

                </h2>


                <p>

                    Explore technologies used in modern
                    web development.

                </p>

            </motion.div>


            <motion.div
                className="technology-cloud"

                variants={staggerContainer}

                initial="hidden"
                whileInView="visible"

                viewport={viewport}
            >

                {technologies.map((tech) => (

                    <motion.div
                        className="technology-pill"

                        key={tech}

                        variants={cardAnimation}

                        whileHover={{
                            y: -8,
                            scale: 1.08,
                        }}
                    >

                        <span>
                            &lt;/&gt;
                        </span>

                        {tech}

                    </motion.div>

                ))}

            </motion.div>

        </section>
    );
};


export default TechStack;