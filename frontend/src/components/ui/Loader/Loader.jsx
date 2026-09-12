import "./Loader.css";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

import logo from "../../../assets/logo/logo.webp";

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

        }, 800);

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

        <div id="loading">

            <div id="grid"></div>

            <motion.div

                id="loading-container"

                initial={{ opacity: 0, scale: 0.8 }}

                animate={{ opacity: 1, scale: 1 }}

                transition={{ duration: .7 }}

            >

                <div id="logo-ring">

                    <img src={logo} alt="" />

                </div>

                <h1>
                    Tech <span>Monster</span>
                </h1>

                <p>{text}</p>

                <div id="progress-box">

                    <motion.div

                        id="progress"

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