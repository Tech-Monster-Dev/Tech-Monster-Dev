import "./StatusPage.css";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

import useAuth from "../../shared/hooks/useAuth";

function StatusPage({
    code,
    title,
    description,
    Icon,
    primaryText = "Go Home",
    secondaryText = "Back",
    primaryPath = "/",
    onPrimaryClick,
    showActions = true,
}) {
    const { user, isAuthenticated } = useAuth() || {};

    const navigate = useNavigate();




    return (
        <section className="status-page">

            <div className="grid"></div>

            <div className="blur blur1"></div>
            <div className="blur blur2"></div>

            <motion.div
                className="status-card"
                initial={{ opacity: 0, scale: .8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: .6 }}
            >

                <motion.div
                    animate={{
                        y: [0, -8, 0],
                        rotate: [0, -5, 5, 0]
                    }}
                    transition={{
                        repeat: Infinity,
                        duration: 3
                    }}
                >
                    <Icon className="status-icon" />
                </motion.div>

                <h1>{code}</h1>

                <h2>{title}</h2>

                <p>{description}</p>

                {showActions && <div className="status-buttons">

                    <button
                        className="primary-btn"
                        onClick={() => {

                            if (onPrimaryClick) {
                                onPrimaryClick();
                                return;
                            }

                            if (isAuthenticated) {

                                if (user?.role === "admin") {

                                    navigate("/admin");

                                } else if (user?.role === "student") {

                                    navigate("/student");

                                } else {

                                    navigate(primaryPath);

                                }

                            } else {

                                navigate(primaryPath);

                            }

                        }}
                    >
                        {primaryText}
                    </button>

                    <button
                        className="secondary-btn"
                        onClick={() => navigate(-1)}
                    >
                        {secondaryText}
                    </button>

                </div>} 

            </motion.div>

        </section>
    );
}

export default StatusPage;