import "./TermsAndConditions.css";

import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
    FaArrowLeft,
    FaShieldAlt,
    FaUserGraduate,
    FaBriefcase,
    FaCode,
    FaBan,
    FaFileContract,
    FaEnvelope
} from "react-icons/fa";

import BackButton from "../../ui/Button/BackButton";

function TermsAndConditions() {
    return (
        <div className="terms-page">

            {/* Background Effects */}
            <div className="terms-grid"></div>
            <div className="terms-glow terms-glow-one"></div>
            <div className="terms-glow terms-glow-two"></div>

            <div className="terms-container">

                {/* Back */}
                <BackButton
                    to="/signup"
                    label="Back to Signup page"
                    className="terms-back"
                />

                {/* Header */}
                <motion.header
                    className="terms-header"
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7 }}
                >
                    <div className="terms-icon">
                        <FaFileContract />
                    </div>

                    <span className="terms-badge">
                        <FaShieldAlt />
                        Legal Information
                    </span>

                    <h1>
                        Terms & <span>Conditions</span>
                    </h1>

                    <p>
                        Please read these Terms and Conditions carefully
                        before using Tech Monster's website, internship
                        programs, and services.
                    </p>

                    <div className="terms-updated">
                        Last Updated: August 8, 2026
                    </div>
                </motion.header>

                {/* Content */}
                <motion.main
                    className="terms-content"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.2 }}
                >

                    {/* 1 */}
                    <section className="terms-section">
                        <div className="section-heading">
                            <span>01</span>
                            <h2>Acceptance of Terms</h2>
                        </div>

                        <p>
                            By accessing or using the Tech Monster website,
                            creating an account, enrolling in an internship
                            program, or using any service provided by Tech
                            Monster, you agree to be bound by these Terms and
                            Conditions.
                        </p>

                        <p>
                            If you do not agree with any part of these terms,
                            you should not use our website or services.
                        </p>
                    </section>

                    {/* 2 */}
                    <section className="terms-section">
                        <div className="section-heading">
                            <span>02</span>
                            <h2>About Tech Monster</h2>
                        </div>

                        <p>
                            Tech Monster is a technology-focused platform that
                            provides internship programs, learning
                            opportunities, practical projects, mentorship,
                            and career-oriented resources for students and
                            aspiring developers.
                        </p>

                        <p>
                            Our programs may include online lessons, learning
                            materials, assignments, practical projects,
                            assessments, certificates, badges, and other
                            educational activities.
                        </p>
                    </section>

                    {/* 3 */}
                    <section className="terms-section">
                        <div className="section-heading">
                            <span>03</span>
                            <h2>Account Registration</h2>
                        </div>

                        <p>
                            To access certain features, you may be required
                            to create an account. You agree to provide
                            accurate, complete, and current information during
                            registration.
                        </p>

                        <ul>
                            <li>
                                You must provide a valid email address.
                            </li>

                            <li>
                                You are responsible for keeping your login
                                credentials secure.
                            </li>

                            <li>
                                You must not share your account credentials
                                with another person.
                            </li>

                            <li>
                                You must notify Tech Monster if you believe
                                your account has been accessed without
                                authorization.
                            </li>
                        </ul>
                    </section>

                    {/* 4 */}
                    <section className="terms-section">
                        <div className="section-heading">
                            <span>04</span>
                            <h2>Internship Programs</h2>
                        </div>

                        <div className="terms-info-card">
                            <FaBriefcase />

                            <div>
                                <h3>Internship Participation</h3>

                                <p>
                                    Internship availability, duration,
                                    eligibility, tasks, projects,
                                    requirements, and benefits may vary
                                    depending on the specific internship
                                    program.
                                </p>
                            </div>
                        </div>

                        <p>
                            Students are expected to actively participate in
                            assigned activities and complete required tasks
                            within the specified time period.
                        </p>

                        <p>
                            Tech Monster may modify, suspend, or discontinue
                            an internship program when necessary.
                        </p>
                    </section>

                    {/* 5 */}
                    <section className="terms-section">
                        <div className="section-heading">
                            <span>05</span>
                            <h2>Student Responsibilities</h2>
                        </div>

                        <div className="responsibility-grid">

                            <div className="responsibility-card">
                                <FaUserGraduate />
                                <h3>Active Participation</h3>
                                <p>
                                    Students should participate actively in
                                    assigned internship activities.
                                </p>
                            </div>

                            <div className="responsibility-card">
                                <FaCode />
                                <h3>Original Work</h3>
                                <p>
                                    Submitted projects, assignments, and code
                                    should be the student's own work unless
                                    collaboration is explicitly permitted.
                                </p>
                            </div>

                            <div className="responsibility-card">
                                <FaShieldAlt />
                                <h3>Account Security</h3>
                                <p>
                                    Students are responsible for protecting
                                    their account credentials and personal
                                    information.
                                </p>
                            </div>

                        </div>
                    </section>

                    {/* 6 */}
                    <section className="terms-section">
                        <div className="section-heading">
                            <span>06</span>
                            <h2>Projects & Intellectual Property</h2>
                        </div>

                        <p>
                            Students may be required to create projects,
                            assignments, code, documentation, designs, or
                            other materials as part of an internship.
                        </p>

                        <p>
                            Students must not knowingly submit copyrighted,
                            stolen, plagiarized, or unauthorized material as
                            their own work.
                        </p>

                        <p>
                            Any use of third-party libraries, assets,
                            frameworks, images, or other resources must
                            comply with the applicable licenses and
                            permissions.
                        </p>
                    </section>

                    {/* 7 */}
                    <section className="terms-section">
                        <div className="section-heading">
                            <span>07</span>
                            <h2>Certificates & Badges</h2>
                        </div>

                        <p>
                            Certificates and badges may be issued to students
                            who satisfy the applicable requirements of an
                            internship program.
                        </p>

                        <p>
                            Completion of an internship does not guarantee
                            employment, placement, salary, or selection by
                            any company.
                        </p>

                        <p>
                            Tech Monster reserves the right to withhold or
                            revoke a certificate or badge where completion
                            requirements have not been satisfied or where
                            fraudulent activity is identified.
                        </p>
                    </section>

                    {/* 8 */}
                    <section className="terms-section">
                        <div className="section-heading">
                            <span>08</span>
                            <h2>Prohibited Activities</h2>
                        </div>

                        <p>
                            Users must not use the platform for unlawful,
                            abusive, fraudulent, or harmful activities.
                        </p>

                        <ul className="danger-list">
                            <li>
                                <FaBan />
                                Creating fake or misleading accounts.
                            </li>

                            <li>
                                <FaBan />
                                Attempting to gain unauthorized access to
                                another user's account.
                            </li>

                            <li>
                                <FaBan />
                                Uploading malicious software or harmful code.
                            </li>

                            <li>
                                <FaBan />
                                Copying or distributing platform content
                                without permission.
                            </li>

                            <li>
                                <FaBan />
                                Using the platform for illegal activities.
                            </li>

                            <li>
                                <FaBan />
                                Attempting to manipulate internship progress,
                                tasks, attendance, or certificates.
                            </li>
                        </ul>
                    </section>

                    {/* 9 */}
                    <section className="terms-section">
                        <div className="section-heading">
                            <span>09</span>
                            <h2>Account Suspension & Termination</h2>
                        </div>

                        <p>
                            Tech Monster may suspend, restrict, or terminate
                            an account if a user violates these Terms and
                            Conditions, engages in fraudulent activity, abuses
                            the platform, or creates a security risk.
                        </p>

                        <p>
                            Where appropriate, users may be notified about
                            significant account restrictions or termination.
                        </p>
                    </section>

                    {/* 10 */}
                    <section className="terms-section">
                        <div className="section-heading">
                            <span>10</span>
                            <h2>Website Availability</h2>
                        </div>

                        <p>
                            We aim to keep the Tech Monster platform available
                            and reliable. However, we do not guarantee that
                            the website or every service will always be
                            available without interruption.
                        </p>

                        <p>
                            Services may occasionally be unavailable due to
                            maintenance, technical problems, updates,
                            security issues, or circumstances outside our
                            reasonable control.
                        </p>
                    </section>

                    {/* 11 */}
                    <section className="terms-section">
                        <div className="section-heading">
                            <span>11</span>
                            <h2>Limitation of Liability</h2>
                        </div>

                        <p>
                            Tech Monster provides its educational platform and
                            internship services on an "as available" basis.
                            We do not guarantee specific academic, career,
                            employment, salary, or placement outcomes.
                        </p>

                        <p>
                            Users are responsible for their own decisions,
                            submissions, projects, and use of information
                            provided through the platform.
                        </p>
                    </section>

                    {/* 12 */}
                    <section className="terms-section">
                        <div className="section-heading">
                            <span>12</span>
                            <h2>Changes to These Terms</h2>
                        </div>

                        <p>
                            Tech Monster may update these Terms and Conditions
                            from time to time to reflect changes in our
                            services, technology, policies, or legal
                            requirements.
                        </p>

                        <p>
                            Updated terms will be published on this page with
                            a revised "Last Updated" date.
                        </p>
                    </section>

                    {/* 13 */}
                    <section className="terms-section">
                        <div className="section-heading">
                            <span>13</span>
                            <h2>Contact Us</h2>
                        </div>

                        <div className="contact-terms-card">
                            <div className="contact-icon">
                                <FaEnvelope />
                            </div>

                            <div>
                                <h3>Questions about these Terms?</h3>

                                <p>
                                    If you have any questions or concerns
                                    regarding these Terms and Conditions,
                                    please contact Tech Monster.
                                </p>

                                <Link to="/contact">
                                    Contact Tech Monster
                                </Link>
                            </div>
                        </div>
                    </section>

                    {/* Agreement */}
                    <section className="terms-agreement">

                        <FaShieldAlt />

                        <h2>
                            Your Agreement
                        </h2>

                        <p>
                            By creating an account and using Tech Monster,
                            you acknowledge that you have read, understood,
                            and agreed to these Terms and Conditions.
                        </p>

                        <Link to="/signup" className="terms-signup-btn">
                            Return to Signup
                        </Link>

                    </section>

                </motion.main>

                {/* Footer */}
                <footer className="terms-footer">
                    <p>
                        © {new Date().getFullYear()} Tech Monster. All rights
                        reserved.
                    </p>

                    <div>
                        <Link to="/privacy-policy">
                            Privacy Policy
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

export default TermsAndConditions;