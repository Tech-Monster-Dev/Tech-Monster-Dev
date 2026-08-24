import "./AuthLayout.css";

import SystemBar from "../../components/common/navbar/SystemBar";
import { useEffect, useRef } from "react";

import { motion } from "framer-motion";

import { Link } from "react-router-dom";

import logo from "../../assets/logo/logo.png";
import authImage from "../../assets/auth/auth-image.jpg";

import BackButton from "../../components/ui/Button/BackButton/BackButton";

function AuthLayout({
    title,
    subtitle,
    children

}) {

    const rightRef = useRef(null);
    const cardRef = useRef(null);

    useEffect(() => {
        const check = () => {
            if (
                cardRef.current.offsetHeight >
                rightRef.current.clientHeight
            ) {
                cardRef.current.className = "top";
            } else {
                cardRef.current.className = "center";
            }
        };

        check();
        window.addEventListener("resize", check);

        return () => window.removeEventListener("resize", check);
    }, []);

    return (

        <div id="auth-layout" >


            <img id="auth-layout-bg-img" src={authImage} alt="Auth image" />

            <SystemBar />

            {/* LEFT SIDE */}

            <div id="authFullCont">

                <motion.div
                    id="auth-left"
                    initial={{ opacity: 0, x: -80 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: .8 }}
                >
                    <div id="auth-left-content">
                        <BackButton
                            to="/"
                            label="Back to Landing Page"
                            className="auth-back-button"
                        />

                        <Link
                            to="/"
                            id="authLogo"
                        >
                            <img
                                src={logo}
                                alt="Tech Monster"
                            />
                            <h2>
                                Tech <span> Monster </span>
                            </h2>
                        </Link>

                        <img
                            src={authImage}
                            id="auth-image"
                            alt="Authentication"
                        />

                        <h1>
                            Build Your Future With Us
                        </h1>

                        <p>
                            Join Tech Monster Pvt. Ltd. and start your internship journey with industry experts.
                        </p>
                    </div>
                </motion.div>

                {/* RIGHT SIDE */}

                <motion.div
                    id="auth-right" ref={rightRef}
                    initial={{ opacity: 0, x: 80 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: .8 }}
                >

                    <div id="auth-card" ref={cardRef}>
                        <div id="auth-header">
                            <h2>
                                {title}
                            </h2>
                            <p>
                                {subtitle}
                            </p>

                        </div>

                        {children}

                    </div>

                </motion.div>


            </div>
        </div>

    );

}

export default AuthLayout;