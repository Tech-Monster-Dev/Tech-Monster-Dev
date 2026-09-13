import "./AuthLayout.css";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

import useAuth from "../../shared/hooks/useAuth";

import logo from "../../assets/logo/logo.webp";
import authImage from "../../assets/auth/auth-image.webp";

import SystemBar from "../../components/common/navbar/SystemBar";
import BackButton from "../../components/ui/Button/BackButton/BackButton";

function AuthLayout({
    title,
    subtitle,
    children

}) {

    const { user } = useAuth();
    const userName = user?.username || '';
    const capitalName = userName.toUpperCase() || userName;

    const rightRef = useRef(null);
    const cardRef = useRef(null);

    useEffect(() => {
        const check = () => {
            if (
                cardRef.current.offsetHeight >
                rightRef.current.clientHeight
            ) {
                cardRef.current.className = "auth-card top";
            } else {
                cardRef.current.className = "auth-card center";
            }
        };

        check();
        window.addEventListener("resize", check);

        return () => window.removeEventListener("resize", check);
    }, []);

    return (

        <div className="auth-layout" >
            <img className="auth-layout-bg-img" src={authImage} alt="Auth image" />
            <SystemBar user={capitalName} />

            {/* LEFT SIDE */}
            <div className="authFullCont">

                <motion.div
                    className="auth-left"
                    initial={{ opacity: 0, x: -80 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: .8 }}
                >
                    <div className="auth-left-content">
                        <BackButton
                            to="/"
                            label="Back to Landing Page"
                            className="auth-back-button"
                        />

                        <Link
                            to="/"
                            className="authLogo"
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
                            className="auth-image"
                            alt="Authentication"
                        />

                        <h1>
                            Build Your Future Skills Strong
                        </h1>
                        <p>
                            Join Tech Monster Pvt. Ltd. and start your learning journey.
                        </p>
                    </div>
                </motion.div>

                {/* RIGHT SIDE */}
                <motion.div
                    className="auth-right" ref={rightRef}
                    initial={{ opacity: 0, x: 80 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: .8 }}
                >
                    <div className="auth-card" ref={cardRef}>
                        <div className="auth-header">
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