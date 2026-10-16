import "./StatusPage.css";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

import useAuth from "../../shared/hooks/useAuth";
import CyberBackground from "../common/CyberBackground/CyberBackground";
import PublicButton from "../ui/Button/PublicButton";

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

    const router = useRouter();




    return (
        <section className="status-page">
            <CyberBackground />

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

                {showActions && (
                    <div className="status-buttons">
                        <PublicButton
                            variant="primary"
                            size="medium"
                            className="status-primary-button"
                            onClick={() => {
                                if (onPrimaryClick) {
                                    onPrimaryClick();
                                    return;
                                }

                                if (isAuthenticated) {
                                    if (user?.role === "admin") {
                                        router.push("/admin");
                                    } else if (user?.role === "student") {
                                        router.push("/student");
                                    } else {
                                        router.push(primaryPath);
                                    }
                                } else {
                                    router.push(primaryPath);
                                }
                            }}
                        >
                            {primaryText}
                        </PublicButton>

                        <PublicButton
                            variant="outline"
                            size="medium"
                            className="status-secondary-button"
                            onClick={() => router.back()}
                        >
                            {secondaryText}
                        </PublicButton>
                    </div>
                )}

            </motion.div>

        </section>
    );
}

export default StatusPage;
