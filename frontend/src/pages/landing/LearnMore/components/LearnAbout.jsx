import { motion } from "framer-motion";

import {
    FiBookOpen,
    FiCheckCircle,
    FiCode,
    FiLayers,
    FiMonitor,
    FiTrendingUp,
} from "react-icons/fi";

import {
    fadeUp,
    fadeLeft,
    staggerContainer,
    cardAnimation,
    viewport,
} from "../../../../shared/animations/motionVariants";


const LearnAbout = () => {

    const checks = [
        "Hands-on learning",
        "Real-world projects",
        "Career-oriented skills",
        "Modern technologies",
    ];


    const cards = [
        {
            icon: FiBookOpen,
            title: "Learn Smart",
            text: "Focus on concepts that actually matter.",
        },
        {
            icon: FiMonitor,
            title: "Build More",
            text: "Turn knowledge into working applications.",
        },
        {
            icon: FiTrendingUp,
            title: "Grow Faster",
            text: "Keep improving with every project.",
        },
    ];


    return (

        <section className="learn-intro">

            <motion.div
                className="learn-section-heading"
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={viewport}
            >

                <span className="learn-section-label">
                    <FiLayers />
                    ABOUT THE PLATFORM
                </span>


                <h2>

                    More Than Just

                    <span>
                        {" "}Coding Tutorials.
                    </span>

                </h2>


                <p>

                    Learning development is not only about watching
                    tutorials. It is about understanding, practicing,
                    building and continuously improving.

                </p>

            </motion.div>


            <div className="intro-content">


                {/* Main Card */}

                <motion.div
                    className="intro-main-card"

                    variants={fadeLeft}

                    initial="hidden"
                    whileInView="visible"

                    viewport={viewport}

                    whileHover={{
                        y: -8,
                        borderColor:
                            "rgba(0,234,255,.4)",
                    }}
                >

                    <motion.div
                        className="intro-icon"

                        whileHover={{
                            rotate: 360,
                            scale: 1.1,
                        }}

                        transition={{
                            duration: 0.6,
                        }}
                    >

                        <FiCode />

                    </motion.div>


                    <h3>
                        From Code To Creation
                    </h3>


                    <p>

                        Tech Monster focuses on helping developers
                        transform their knowledge into actual products.
                        Learn the technology, understand the logic,
                        build the project, solve problems and create
                        something you can proudly showcase.

                    </p>


                    <div className="intro-checks">

                        {checks.map((item) => (

                            <motion.div
                                key={item}

                                initial={{
                                    opacity: 0,
                                    x: -15,
                                }}

                                whileInView={{
                                    opacity: 1,
                                    x: 0,
                                }}

                                viewport={{
                                    once: true,
                                }}

                                transition={{
                                    duration: 0.5,
                                }}
                            >

                                <FiCheckCircle />

                                <span>
                                    {item}
                                </span>

                            </motion.div>

                        ))}

                    </div>

                </motion.div>


                {/* Side Cards */}

                <motion.div
                    className="intro-side-cards"

                    variants={staggerContainer}

                    initial="hidden"
                    whileInView="visible"

                    viewport={viewport}
                >

                    {cards.map(
                        ({ icon: Icon, title, text }, index) => (

                            <motion.div
                                className="mini-card"
                                key={title}

                                variants={cardAnimation}

                                whileHover={{
                                    x: 10,
                                    scale: 1.02,
                                }}
                            >

                                <span className="mini-number">
                                    0{index + 1}
                                </span>

                                <Icon />

                                <h4>
                                    {title}
                                </h4>

                                <p>
                                    {text}
                                </p>

                            </motion.div>

                        )
                    )}

                </motion.div>

            </div>

        </section>
    );
};


export default LearnAbout;