import { motion } from "framer-motion";

import {
    FiTrendingUp,
} from "react-icons/fi";

import {
    fadeUp,
    viewport,
} from "../../../../shared/animations/motionVariants";


const LearningJourney = () => {

    const journey = [
        {
            number: "01",
            title: "Learn",
            text: "Understand the fundamentals and build a strong technical foundation.",
        },
        {
            number: "02",
            title: "Practice",
            text: "Solve coding problems and practice concepts through hands-on exercises.",
        },
        {
            number: "03",
            title: "Build",
            text: "Turn your knowledge into real-world projects that demonstrate your abilities.",
        },
        {
            number: "04",
            title: "Grow",
            text: "Improve your portfolio, learn advanced concepts and prepare for your career.",
        },
    ];


    return (

        <section
            className="learning-journey"
            id="learning-journey"
        >

            <motion.div
                className="learn-section-heading center"

                variants={fadeUp}

                initial="hidden"
                whileInView="visible"

                viewport={viewport}
            >

                <span className="learn-section-label">

                    <FiTrendingUp />

                    YOUR JOURNEY

                </span>


                <h2>

                    Learn.

                    <span>
                        {" "}Build.
                    </span>

                    Grow.

                </h2>


                <p>

                    A simple path from beginner knowledge
                    to real-world development experience.

                </p>

            </motion.div>


            <div className="journey-container">

                <div className="journey-line" />


                {journey.map((item, index) => (

                    <motion.div
                        key={item.number}

                        className={`journey-item ${
                            index % 2 === 0
                                ? "left"
                                : "right"
                        }`}

                        initial={{
                            opacity: 0,

                            x:
                                index % 2 === 0
                                    ? -70
                                    : 70,
                        }}

                        whileInView={{
                            opacity: 1,
                            x: 0,
                        }}

                        viewport={{
                            once: true,
                            amount: 0.2,
                        }}

                        transition={{
                            duration: 0.7,
                            delay: index * 0.12,
                        }}
                    >

                        <motion.div
                            className="journey-number"

                            whileHover={{
                                scale: 1.2,

                                boxShadow:
                                    "0 0 30px rgba(0,234,255,.5)",
                            }}
                        >

                            {item.number}

                        </motion.div>


                        <motion.div
                            className="journey-card"

                            whileHover={{
                                scale: 1.03,
                            }}
                        >

                            <span>
                                STEP {item.number}
                            </span>

                            <h3>
                                {item.title}
                            </h3>

                            <p>
                                {item.text}
                            </p>

                        </motion.div>

                    </motion.div>

                ))}

            </div>

        </section>
    );
};


export default LearningJourney;