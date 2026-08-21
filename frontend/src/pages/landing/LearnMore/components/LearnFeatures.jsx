import { motion } from "framer-motion";

import {
    FiArrowRight,
    FiAward,
    FiBookOpen,
    FiBriefcase,
    FiCode,
    FiTrendingUp,
    FiUsers,
    FiZap,
} from "react-icons/fi";

import {
    fadeUp,
    staggerContainer,
    cardAnimation,
    viewport,
} from "../../../../shared/animations/motionVariants";


const LearnFeatures = () => {

    const features = [
        {
            icon: FiCode,
            title: "Real-World Projects",
            description:
                "Work on practical projects that help you understand how real development teams build modern applications.",
        },
        {
            icon: FiUsers,
            title: "Expert Mentorship",
            description:
                "Learn from experienced developers and get guidance while building your technical skills.",
        },
        {
            icon: FiBriefcase,
            title: "Career Focused",
            description:
                "Build a strong portfolio and develop skills that can help you prepare for internships and jobs.",
        },
        {
            icon: FiAward,
            title: "Skill Development",
            description:
                "Improve your coding, problem-solving, teamwork and project development abilities.",
        },
        {
            icon: FiBookOpen,
            title: "Structured Learning",
            description:
                "Follow a clear learning path instead of randomly jumping between technologies and tutorials.",
        },
        {
            icon: FiTrendingUp,
            title: "Continuous Growth",
            description: "Keep improving your skills with projects, challenges, learning resources and new technologies.",
        },
    ];


    return (

        <section
            className="learn-features"
            id="learn-features"
        >

            <motion.div
                className="learn-section-heading center"

                variants={fadeUp}

                initial="hidden"
                whileInView="visible"

                viewport={viewport}
            >

                <span className="learn-section-label">

                    <FiZap />

                    WHAT YOU GET

                </span>


                <h2>

                    Everything You Need To

                    <span>
                        {" "}Grow.
                    </span>

                </h2>


                <p>
                    A complete environment designed around
                    practical developer growth.
                </p>

            </motion.div>


            <motion.div
                className="feature-grid"

                variants={staggerContainer}

                initial="hidden"
                whileInView="visible"

                viewport={viewport}
            >

                {features.map(
                    ({ icon: Icon, title, description }, index) => (

                        <motion.article
                            className="feature-card"
                            key={title}

                            variants={cardAnimation}

                            whileHover={{
                                y: -12,
                                scale: 1.02,
                            }}
                        >

                            <div className="feature-number">
                                0{index + 1}
                            </div>


                            <motion.div
                                className="feature-icon"

                                whileHover={{
                                    rotate: [0, -10, 10, 0],
                                    scale: 1.1,
                                }}
                            >

                                <Icon />

                            </motion.div>


                            <h3>
                                {title}
                            </h3>


                            <p>
                                {description}
                            </p>


                            <motion.div
                                className="feature-arrow"

                                whileHover={{
                                    x: 8,
                                }}
                            >

                                <FiArrowRight />

                            </motion.div>

                        </motion.article>

                    )
                )}

            </motion.div>

        </section>
    );
};


export default LearnFeatures;