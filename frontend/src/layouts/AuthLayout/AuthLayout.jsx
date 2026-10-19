import "./AuthLayout.css";

import { useEffect, useRef } from "react";
import Link from "next/link";

import useAuth from "../../shared/hooks/useAuth";


import SystemBar from "../../components/common/navbar/SystemBar";
import BackButton from "../../components/ui/Button/BackButton/BackButton";
import CyberBackground from "../../components/common/CyberBackground";

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

        <div className="auth-layout cyber-page">
            <CyberBackground />
            <SystemBar user={capitalName} />

            {/* LEFT SIDE */}
            <div className="authFullCont">
                <div
                    className="auth-left"
                >
                    <BackButton to="/" label="Back to Landing Page" className="auth-back-button" />
                    <div className="auth-left-content">

                        <Link
                            href="/"
                            className="authLogo"
                        >
                            <img
                                src="/assets/logo/logo.webp"
                                alt="Tech Monster"
                                width={80}
                                height={80}
                            />
                            <h2>
                                Tech <span> Monster </span>
                            </h2>
                        </Link>

                        <img
                            src="/assets/auth/auth-image.webp"
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
                </div>

                {/* RIGHT SIDE */}
                <div
                    className="auth-right" ref={rightRef}
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
                </div>
            </div>
        </div>
    );
}

export default AuthLayout;