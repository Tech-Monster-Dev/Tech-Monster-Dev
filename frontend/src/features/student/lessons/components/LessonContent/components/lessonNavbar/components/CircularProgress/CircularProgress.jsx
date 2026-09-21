import "./CircularProgress.css";

import { motion } from "framer-motion";

export default function CircularProgress({
    value = 0
}) {
    const percent = Math.min(
        100,
        Math.max(0, Math.round(value || 0))
    );

    const radius = 24;
    const stroke = 4;

    const normalizedRadius = radius - stroke * 0.5;

    const circumference =
        normalizedRadius * 2 * Math.PI;

    const strokeDashoffset =
        circumference -
        (percent / 100) * circumference;

    return (
        <motion.div
            className="lesson-navbar-circle-progress"
            initial={{
                opacity: 0,
                scale: 0.8
            }}
            animate={{
                opacity: 1,
                scale: 1
            }}
            transition={{
                duration: 0.6
            }}
        >
            <svg
                viewBox="0 0 48 48"
                preserveAspectRatio="xMidYMid meet"
                aria-label={`Lesson progress ${percent}%`}
                role="img"
            >
                <defs>
                    <linearGradient
                        id="circleGradient"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="100%"
                    >
                        <stop
                            offset="0%"
                            stopColor="#00d4ff"
                        />

                        <stop
                            offset="100%"
                            stopColor="#00ff95"
                        />
                    </linearGradient>
                </defs>

                <circle
                    className="lesson-navbar-circle-progress-bg"
                    strokeWidth={stroke}
                    r={normalizedRadius}
                    cx="24"
                    cy="24"
                />

                <motion.circle
                    className="lesson-navbar-circle-progress-bar"
                    stroke="url(#circleGradient)"
                    strokeWidth={stroke}
                    strokeLinecap="round"
                    fill="transparent"
                    r={normalizedRadius}
                    cx="24"
                    cy="24"
                    strokeDasharray={circumference}
                    initial={{
                        strokeDashoffset: circumference
                    }}
                    animate={{
                        strokeDashoffset
                    }}
                    transition={{
                        duration: 0.8,
                        ease: "easeOut"
                    }}
                />
            </svg>

            <div className="lesson-navbar-circle-progress-content">
                <h2>
                    {percent}%
                </h2>
            </div>
        </motion.div>
    );
}