import { motion } from "framer-motion";
import { FiArrowLeft } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

import "./BackButton.css";

const BackButton = ({
    to = "/",
    label = "Back",
    className = "",
}) => {

    const navigate = useNavigate();

    const handleBack = () => {
        navigate(to);
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