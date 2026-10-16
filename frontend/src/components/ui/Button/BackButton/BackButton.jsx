"use client";
import { motion } from "framer-motion";
import { FiArrowLeft } from "react-icons/fi";
import { useRouter } from "next/navigation";

import "./BackButton.css";

const BackButton = ({
    to = "/",
    label = "Back",
    className = "",
    onClick,
}) => {

    const router = useRouter();

    const handleBack = () => {
        if (typeof onClick === "function") {
            onClick();
            return;
        }

        router.push(to);
    };

    return (
        <motion.button
            type="button"
            className={`back-button ${className}`}
            onClick={handleBack}

            initial={{
                opacity: 0,
                scale: 0.8,
            }}

            animate={{
                opacity: 1,
                scale: 1,
            }}

            whileHover={{
                scale: 1.05,
            }}

            whileTap={{
                scale: 0.9,
            }}

            transition={{
                duration: 0.25,
            }}
        >

            <span className="back-button-icon">
                <FiArrowLeft />
            </span>

            <span className="back-button-tooltip">
                {label}
            </span>

        </motion.button>
    );
};

export default BackButton;