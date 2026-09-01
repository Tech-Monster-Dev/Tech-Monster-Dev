import "./PrivacyPolicy.css";

import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
    FaArrowLeft,
    FaShieldAlt,
    FaUserShield,
    FaDatabase,
    FaLock,
    FaEnvelope,
    FaUserCheck
} from "react-icons/fa";

import BackButton from "../../ui/Button/BackButton/BackButton";


function PrivacyPolicy() {
    return (
        <div className="privacy-page">

            <div className="privacy-grid"></div>
            <div className="privacy-glow privacy-glow-one"></div>
            <div className="privacy-glow privacy-glow-two"></div>

            <div className="privacy-container">

                <BackButton
                    to="/"
                    label="Back to Landing Page"
                    className="privacy-back"
                />

                <motion.header
                    className="privacy-header"
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7 }}
                >
                    <div className="privacy-icon">
                        <FaShieldAlt />
                    </div>

                    <span className="privacy-badge">
                        <FaUserShield />
                        Privacy & Security
                    </span>

                    <h1>
                        Privacy <span>Policy</span>
                    </h1>

                    <p>
                        This Privacy Policy explains how Tech Monster
                        collects, uses, protects, and handles information
                        when you use our website, educational programs,
                        internships, and related services.
                    </p>

                    <div className="privacy-updated">
                        Last Updated: September 1, 2026
                    </div>
                </motion.header>


                <motion.main
                    className="privacy-content"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.2 }}
                >

                    <section className="privacy-section">
                        <div className="section-heading">
                            <span>01</span>
                            <h2>Information We Collect</h2>
                        </div>

                        <p>
                            When you create an account, enroll in a course
                            or internship, communicate with us, or use our
                            services, we may collect information necessary
                            to provide and manage those services.
                        </p>

                        <ul>
                            <li>Name and account information.</li>
                            <li>Email address and contact information.</li>
                            <li>Course or internship enrollment information.</li>
                            <li>Learning progress, tasks, attendance, and completion information.</li>
                            <li>Certificate and payment-related information.</li>
                            <li>Messages and support requests submitted to Tech Monster.</li>
                        </ul>
                    </section>


                    <section className="privacy-section">
                        <div className="section-heading">
                            <span>02</span>
                            <h2>How We Use Information</h2>
                        </div>

                        <p>
                            We use collected information to operate and
                            improve Tech Monster and to provide the services
                            requested by students.
                        </p>

                        <ul>
                            <li>Creating and managing student accounts.</li>
                            <li>Managing course and internship enrollment.</li>
                            <li>Tracking lessons, tasks, attendance, and completion.</li>
                            <li>Processing certificate-related payments.</li>
                            <li>Reviewing and approving certificate requests.</li>
                            <li>Providing customer support and responding to enquiries.</li>
                            <li>Maintaining platform security and preventing fraudulent activity.</li>
                        </ul>
                    </section>


                    <section className="privacy-section">
                        <div className="section-heading">
                            <span>03</span>
                            <h2>Payment Information</h2>
                        </div>

                        <div className="privacy-info-card">
                            <FaLock />

                            <div>
                                <h3>Secure Payment Processing</h3>

                                <p>
                                    Certificate payments are processed through
                                    our authorized payment gateway. Tech Monster
                                    does not intentionally store complete card,
                                    UPI, or banking credentials on its own servers.
                                </p>
                            </div>
                        </div>

                        <p>
                            Payment-related information may be received or
                            processed by the payment service provider according
                            to its own privacy policy, security practices,
                            and applicable requirements.
                        </p>
                    </section>


                    <section className="privacy-section">
                        <div className="section-heading">
                            <span>04</span>
                            <h2>Information Security</h2>
                        </div>

                        <p>
                            Tech Monster takes reasonable technical and
                            organizational measures to protect user information
                            against unauthorized access, misuse, alteration,
                            disclosure, or destruction.
                        </p>

                        <div className="privacy-card-grid">

                            <div className="privacy-card">
                                <FaLock />
                                <h3>Account Security</h3>
                                <p>
                                    Users are responsible for keeping their
                                    account credentials confidential.
                                </p>
                            </div>

                            <div className="privacy-card">
                                <FaDatabase />
                                <h3>Data Protection</h3>
                                <p>
                                    Access to platform information is controlled
                                    according to operational requirements.
                                </p>
                            </div>

                            <div className="privacy-card">
                                <FaUserCheck />
                                <h3>Responsible Access</h3>
                                <p>
                                    Users must not attempt unauthorized access
                                    to accounts, systems, or platform data.
                                </p>
                            </div>

                        </div>
                    </section>


                    <section className="privacy-section">
                        <div className="section-heading">
                            <span>05</span>
                            <h2>Information Sharing</h2>
                        </div>

                        <p>
                            Tech Monster does not sell personal information
                            for advertising purposes. Information may be shared
                            with service providers when reasonably necessary to
                            operate the platform, process payments, provide
                            communications, maintain infrastructure, or comply
                            with applicable legal requirements.
                        </p>
                    </section>


                    <section className="privacy-section">
                        <div className="section-heading">
                            <span>06</span>
                            <h2>Cookies & Technical Information</h2>
                        </div>

                        <p>
                            Tech Monster may use cookies, local storage,
                            session information, analytics, and similar
                            technologies where necessary for authentication,
                            security, functionality, preferences, and platform
                            performance.
                        </p>
                    </section>


                    <section className="privacy-section">
                        <div className="section-heading">
                            <span>07</span>
                            <h2>Third-Party Services</h2>
                        </div>

                        <p>
                            Tech Monster may use third-party services for
                            payments, email communication, hosting, analytics,
                            authentication, infrastructure, or other operational
                            requirements. Those services may process information
                            according to their own policies.
                        </p>
                    </section>


                    <section className="privacy-section">
                        <div className="section-heading">
                            <span>08</span>
                            <h2>Children's Privacy</h2>
                        </div>

                        <p>
                            Tech Monster is intended for users who are legally
                            able to use the services under applicable law.
                            We do not knowingly collect personal information
                            from children in violation of applicable legal
                            requirements.
                        </p>
                    </section>


                    <section className="privacy-section">
                        <div className="section-heading">
                            <span>09</span>
                            <h2>Changes to This Policy</h2>
                        </div>

                        <p>
                            Tech Monster may update this Privacy Policy when
                            our services, technology, operational practices,
                            or legal requirements change. The updated version
                            will be published on this page with a revised
                            "Last Updated" date.
                        </p>
                    </section>


                    <section className="privacy-section">
                        <div className="section-heading">
                            <span>10</span>
                            <h2>Contact Us</h2>
                        </div>

                        <div className="privacy-contact-card">

                            <div className="privacy-contact-icon">
                                <FaEnvelope />
                            </div>

                            <div>
                                <h3>Questions about Privacy?</h3>

                                <p>
                                    If you have questions or concerns about
                                    this Privacy Policy or the handling of
                                    your information, please contact Tech Monster.
                                </p>

                                <Link to="/contact">
                                    Contact Tech Monster
                                </Link>
                            </div>

                        </div>
                    </section>


                    <section className="privacy-agreement">

                        <FaShieldAlt />

                        <h2>
                            Your Privacy Matters
                        </h2>

                        <p>
                            By using Tech Monster, you acknowledge that you
                            have read and understood this Privacy Policy.
                        </p>

                        <Link
                            to="/"
                            className="privacy-home-btn"
                        >
                            Return to Tech Monster
                        </Link>

                    </section>

                </motion.main>


                <footer className="privacy-footer">

                    <p>
                        © {new Date().getFullYear()} Tech Monster.
                        All rights reserved.
                    </p>

                    <div>
                        <Link to="/terms-and-conditions">
                            Terms & Conditions
                        </Link>

                        <span>•</span>

                        <Link to="/contact">
                            Contact
                        </Link>
                    </div>

                </footer>

            </div>
        </div>
    );
}


export default PrivacyPolicy;
