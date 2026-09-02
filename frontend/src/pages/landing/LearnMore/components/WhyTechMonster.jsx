import { motion } from "framer-motion";

import {
    FiAward,
    FiCheckCircle,
    FiCode,
} from "react-icons/fi";

import {
    fadeRight,
    viewport,
} from "../../../../shared/animations/motionVariants";


const WhyTechMonster = () => {

    const points = [
        {
            title: "Project-Based Learning",
            text: "Learn by actually building.",
        },
        {
            title: "Developer Mindset",
            text: "Learn how to think and solve problems.",
        },
        {
            title: "Portfolio Ready",
            text: "Create projects worth showcasing.",
        },
    ];


    return (

        <section className="why-section">


            {/* =========================================
                VISUAL
            ========================================= */}

            <motion.div
                className="why-visual"

                initial={{
                    opacity: 0,
                    scale: 0.7,
                }}

                whileInView={{
                    opacity: 1,
                    scale: 1,
                }}

                viewport={viewport}

                transition={{
                    duration: 1,
                }}
            >

                <motion.div
                    className="why-circle circle-one"

                    animate={{
                        rotate: 360,
                    }}

                    transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: "linear",
                    }}
                />


                <motion.div
                    className="why-circle circle-two"

                    animate={{
                        rotate: -360,
                    }}

                    transition={{
                        duration: 12,
                        repeat: Infinity,
                        ease: "linear",
                    }}
                />


                <motion.div
                    className="why-center"

                    animate={{
                        y: [0, -10, 0],
                    }}

                    transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                >

                    <FiCode />

                    <strong>
                        CODE
                    </strong>

                    <span>
                        SECURE
                    </span>

                    <span>
                        SOLVE
                    </span>

                </motion.div>

            </motion.div>


            {/* =========================================
                CONTENT
            ========================================= */}

            <motion.div
                className="why-content"

                variants={fadeRight}

                initial="hidden"
                whileInView="visible"

                viewport={viewport}
            >

                <span className="learn-section-label">

                    <FiAward />

                    WHY TECH MONSTER

                </span>


                <h2>

                    Don't Just

                    <span>
                        {" "}Learn Coding.
                    </span>

                    <br />

                    Build Real Technical Skills.

                </h2>


                <p>

                    The goal is simple — help you become confident
                    enough to take an idea, write the code, solve
                    the problems and turn it into a real product.

                </p>


                <div className="why-list">

                    {points.map(({ title, text }) => (

                        <motion.div
                            key={title}

                            whileHover={{
                                x: 8,
                            }}
                        >

                            <FiCheckCircle />

                            <section>

                                <h4>
                                    {title}
                                </h4>

                                <p>
                                    {text}
                                </p>

                            </section>

                        </motion.div>

                    ))}

                </div>

            </motion.div>

        </section>
    );
};


export default WhyTechMonster;