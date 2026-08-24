import { motion } from "framer-motion";
import {useNavigate} from "react-router-dom";

import {
    FiArrowRight,
    FiMonitor,
    FiZap,
} from "react-icons/fi";

import {
    fadeUp,
    staggerContainer,
    cardAnimation,
} from "../../../../shared/animations/motionVariants";


const LearnHero = () => {
    const navigate = useNavigate();

    return (

        <section className="learn-hero">
            {/* Animated Background Grid */}
            <motion.div
                className="learn-grid"
                animate={{
                    backgroundPosition: [
                        "0px 0px",
                        "45px 45px",
                    ],
                }}
                transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "linear",
                }}
            />

            {/* =========================================
                LEFT CONTENT
            ========================================= */}
            <motion.div
                className="learn-hero-content"
                initial="hidden"
                animate="visible"
                variants={staggerContainer}
            >
                {/* Badge */}
                <motion.div
                    className="learn-hero-badge"
                    variants={fadeUp}
                    whileHover={{
                        scale: 1.05,
                        boxShadow:
                            "0 0 30px rgba(0,234,255,.3)",
                    }}
                >
                    <FiZap />
                    <span>
                        LEVEL UP YOUR DEVELOPMENT
                    </span>
                </motion.div>

                {/* Title */}
                <motion.h1 variants={fadeUp}>
                    Build Skills.
                    <span>
                        {" "}Build Projects.
                    </span>
                    <br />
                    Build Your Future.
                </motion.h1>

                {/* Description */}
                <motion.p variants={fadeUp}>
                    Tech Monster is a developer-focused learning
                    platform designed to help you move from learning
                    concepts to building real-world applications.
                </motion.p>

                {/* Buttons */}
                <motion.div
                    className="learn-hero-buttons"
                    variants={fadeUp}
                >
                    <motion.button
                        className="learn-primary-btn"
                        whileHover={{
                            scale: 1.05,
                            y: -4,
                        }}
                        whileTap={{
                            scale: 0.95,
                        }}
                        onClick={()=> navigate('/')}
                    >
                        Explore Tech Monster
                        <motion.span
                            animate={{
                                x: [0, 6, 0],
                            }}
                            transition={{
                                duration: 1.2,
                                repeat: Infinity,
                            }}
                        >
                            <FiArrowRight />
                        </motion.span>
                    </motion.button>

                    <motion.button
                        className="learn-outline-btn"
                        whileHover={{
                            scale: 1.05,
                            y: -4,
                        }}
                        whileTap={{
                            scale: 0.95,
                        }}
                    >
                        How It Works
                        <FiMonitor />
                    </motion.button>
                </motion.div>

                {/* Stats */}
                <motion.div
                    className="learn-hero-stats"
                    variants={staggerContainer}
                >
                    {[
                        ["100%", "Practical"],
                        ["10+", "Technologies"],
                        ["∞", "Possibilities"],
                    ].map(([number, label]) => (
                        <motion.div
                            key={label}
                            variants={cardAnimation}
                            whileHover={{
                                y: -8,
                                scale: 1.08,
                            }}
                        >
                            <strong>
                                {number}
                            </strong>
                            <span>
                                {label}
                            </span>
                        </motion.div>
                    ))}
                </motion.div>
            </motion.div>

            {/* =========================================
                RIGHT TERMINAL
            ========================================= */}
            <motion.div
                className="learn-terminal-wrapper"
                initial={{
                    opacity: 0,
                    x: 100,
                    scale: 0.8,
                }}
                animate={{
                    opacity: 1,
                    x: 0,
                    scale: 1,
                }}
                transition={{
                    duration: 1.2,
                    delay: 0.4,
                    ease: [0.22, 1, 0.36, 1],
                }}
            >
                {/* Orbit 1 */}
                <motion.div
                    className="learn-orbit orbit-one"
                    animate={{
                        rotate: 360,
                    }}
                    transition={{
                        duration: 18,
                        repeat: Infinity,
                        ease: "linear",
                    }}
                />

                {/* Orbit 2 */}
                <motion.div
                    className="learn-orbit orbit-two"
                    animate={{
                        rotate: -360,
                    }}
                    transition={{
                        duration: 12,
                        repeat: Infinity,
                        ease: "linear",
                    }}
                />

                {/* Terminal */}
                <motion.div
                    className="learn-terminal"
                    animate={{
                        y: [0, -15, 0],
                        rotateY: [-8, -5, -8],
                    }}
                    transition={{
                        duration: 5,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                    whileHover={{
                        scale: 1.04,
                        boxShadow:
                            "0 0 60px rgba(0,234,255,.25)",
                    }}
                >
                    <div className="terminal-header">
                        <div className="terminal-dots">
                            <span />
                            <span />
                            <span />
                        </div>
                        <p>
                            tech-monster.dev
                        </p>
                    </div>

                    <div className="terminal-body">
                        <div className="terminal-line">
                            <span className="terminal-purple">
                                const
                            </span>
                            <span className="terminal-white">
                                developer
                            </span>
                            <span className="terminal-blue">
                                =
                            </span>
                            <span className="terminal-green">
                                {"{"}
                            </span>
                        </div>

                        <div className="terminal-line indent">
                            <span className="terminal-blue">
                                skills:
                            </span>
                            <span className="terminal-yellow">
                                ["React", "Node", "MongoDB"]
                            </span>
                        </div>

                        <div className="terminal-line indent">
                            <span className="terminal-blue">
                                projects:
                            </span>
                            <span className="terminal-yellow">
                                "real-world"
                            </span>
                        </div>

                        <div className="terminal-line indent">
                            <span className="terminal-blue">
                                future:
                            </span>
                            <span className="terminal-green">
                                "BRIGHT"
                            </span>
                        </div>

                        <div className="terminal-line">
                            <span className="terminal-green">
                                {"}"}
                            </span>
                        </div>

                        <motion.div
                            className="terminal-cursor"
                            animate={{
                                opacity: [1, 0, 1],
                            }}
                            transition={{
                                duration: 1,
                                repeat: Infinity,
                            }}
                        >
                            ▊
                        </motion.div>
                    </div>
                </motion.div>
            </motion.div>

        </section>
    );
};


export default LearnHero;