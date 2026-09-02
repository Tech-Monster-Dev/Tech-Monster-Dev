import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

import {
    FiArrowRight,
    FiZap,
} from "react-icons/fi";

import {viewport} from "../../../../shared/animations/motionVariants";


const LearnCTA = () => {
    const navigate = useNavigate();

    return (

        <section className="learn-cta">


            {/* Animated Grid */}

            <motion.div
                className="cta-grid"

                animate={{
                    backgroundPosition: [
                        "0px 0px",
                        "45px 45px",
                    ],
                }}

                transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "linear",
                }}
            />


            <motion.div
                className="cta-content"

                initial={{
                    opacity: 0,
                    y: 60,
                }}

                whileInView={{
                    opacity: 1,
                    y: 0,
                }}

                viewport={viewport}

                transition={{
                    duration: 0.8,
                }}
            >

                <span className="section-label">

                    <FiZap />

                    READY TO START?

                </span>


                <h2>

                    Your Next Level

                    <span>
                        {" "}Starts Here.
                    </span>

                </h2>


                <p>

                    Go beyond tutorials. Start building,
                    experimenting and strengthening your
                    practical technical skills.

                </p>


                <motion.button
                    className="learn-primary-btn cta-button"

                    whileHover={{
                        scale: 1.08,
                        y: -5,
                    }}

                    whileTap={{
                        scale: 0.95,
                    }}

                    onClick={() => navigate("/signup")}
                >

                    Start Your Journey

                    <motion.span

                        animate={{
                            x: [0, 7, 0],
                        }}

                        transition={{
                            duration: 1.2,
                            repeat: Infinity,
                        }}
                    >

                        <FiArrowRight />

                    </motion.span>

                </motion.button>

            </motion.div>

        </section>
    );
};


export default LearnCTA;