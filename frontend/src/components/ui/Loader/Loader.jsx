import "./Loader.css";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";


function Loading({ finish }) {
    const [progress, setProgress] = useState(0);
    const [text, setText] = useState("Initializing System...");

    useEffect(() => {
        const messages = [
            "Initializing System...",
            "Loading Components...",
            "Connecting Secure Server...",
            "Preparing Dashboard...",
            "Launching Tech Monster..."
        ];

        let messageIndex = 0;
        const msgInterval = setInterval(() => {
            messageIndex++;
            if (messageIndex < messages.length)
                setText(messages[messageIndex]);
        }, 350);

        const timer = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(timer);
                    clearInterval(msgInterval);
                    setTimeout(() => {
                        finish(false);
                    }, 500);
                    return 100;
                }
                return prev + 2;
            });

        }, 60);

        return () => {
            clearInterval(timer);
            clearInterval(msgInterval);
        };

    }, [finish]);

    return (

        <div className="loading">
            <div className="grid"></div>

            <motion.div
                className="loading-container"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: .7 }}
            >
                <div className="logo-ring">
                    <img src="/assets/logo/logo-optimized.webp" alt="" />
                </div>

                <h1>
                    Tech <span>Monster</span>
                </h1>

                <p>{text}</p>

                <div className="progress-box">
                    <motion.div
                        className="progress"
                        animate={{
                            width: `${progress}%`
                        }}
                    />
                </div>

                <span>{progress}%</span>
            </motion.div>
        </div>
    )
}

export default Loading;