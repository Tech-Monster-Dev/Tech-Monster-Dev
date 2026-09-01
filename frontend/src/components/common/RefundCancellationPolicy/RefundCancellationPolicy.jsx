import "./RefundCancellationPolicy.css";

import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
    FaBan,
    FaFileInvoiceDollar,
    FaCertificate,
    FaHeadset,
    FaCheckCircle,
    FaExclamationTriangle
} from "react-icons/fa";

import BackButton from "../../ui/Button/BackButton/BackButton";


function RefundCancellationPolicy() {
    return (
        <div className="refund-policy-page">

            <div className="refund-policy-grid"></div>

            <div className="refund-policy-glow refund-policy-glow-one"></div>
            <div className="refund-policy-glow refund-policy-glow-two"></div>

            <div className="refund-policy-container">

                <BackButton
                    to="/"
                    label="Back to Landing Page"
                    className="refund-policy-back"
                />


                <motion.header
                    className="refund-policy-header"
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7 }}
                >

                    <div className="refund-policy-icon">
                        <FaFileInvoiceDollar />
                    </div>

                    <span className="refund-policy-badge">
                        <FaBan />
                        Refund & Cancellation
                    </span>

                    <h1>
                        Refund & <span>Cancellation Policy</span>
                    </h1>

                    <p>
                        Please read this policy carefully before enrolling
                        in a Tech Monster course or internship and before
                        making a certificate payment.
                    </p>

                    <div className="refund-policy-updated">
                        Last Updated: September 1, 2026
                    </div>

                </motion.header>


                <motion.main
                    className="refund-policy-content"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.2 }}
                >

                    <section className="refund-policy-section">

                        <div className="refund-section-heading">
                            <span>01</span>
                            <h2>Course & Internship Enrollment</h2>
                        </div>

                        <div className="refund-highlight">
                            <FaBan />

                            <div>
                                <h3>Enrollment Cancellation Is Not Available</h3>

                                <p>
                                    Once a student successfully enrolls in a
                                    Tech Monster course or internship, the
                                    enrollment cannot be cancelled through
                                    the platform.
                                </p>
                            </div>
                        </div>

                        <p>
                            Students should review the available program
                            information, requirements, duration, and applicable
                            terms before completing enrollment.
                        </p>

                    </section>


                    <section className="refund-policy-section">

                        <div className="refund-section-heading">
                            <span>02</span>
                            <h2>Certificate Payment</h2>
                        </div>

                        <div className="refund-highlight">

                            <FaFileInvoiceDollar />

                            <div>
                                <h3>Certificate Payment Is Non-Refundable</h3>

                                <p>
                                    Once a certificate payment has been
                                    successfully completed, the payment is
                                    non-refundable and non-cancellable,
                                    subject to applicable law and valid
                                    payment-provider dispute rights.
                                </p>
                            </div>

                        </div>

                        <p>
                            Certificate payment is required only after the
                            applicable course or internship has been completed
                            and the student is eligible to request a certificate.
                        </p>

                    </section>


                    <section className="refund-policy-section">

                        <div className="refund-section-heading">
                            <span>03</span>
                            <h2>Certificate Approval Process</h2>
                        </div>

                        <div className="refund-process">

                            <div className="refund-process-item">
                                <div className="refund-process-number">1</div>

                                <div>
                                    <h3>Program Completion</h3>
                                    <p>
                                        The student completes the applicable
                                        course or internship requirements.
                                    </p>
                                </div>
                            </div>


                            <div className="refund-process-item">
                                <div className="refund-process-number">2</div>

                                <div>
                                    <h3>Certificate Payment</h3>
                                    <p>
                                        The student completes the required
                                        certificate payment through the
                                        available payment gateway.
                                    </p>
                                </div>
                            </div>


                            <div className="refund-process-item">
                                <div className="refund-process-number">3</div>

                                <div>
                                    <h3>Admin Review</h3>
                                    <p>
                                        The payment and certificate request
                                        may be reviewed by the Tech Monster
                                        administration team.
                                    </p>
                                </div>
                            </div>


                            <div className="refund-process-item">
                                <div className="refund-process-number">4</div>

                                <div>
                                    <h3>Certificate Issuance</h3>
                                    <p>
                                        After the required approval, the
                                        eligible student can receive the
                                        certificate.
                                    </p>
                                </div>
                            </div>

                        </div>

                    </section>


                    <section className="refund-policy-section">

                        <div className="refund-section-heading">
                            <span>04</span>
                            <h2>Payment Successful but Certificate Not Received</h2>
                        </div>

                        <div className="refund-support-card">

                            <div className="refund-support-icon">
                                <FaHeadset />
                            </div>

                            <div>
                                <h3>Contact Tech Monster Support</h3>

                                <p>
                                    If a student has successfully completed
                                    the certificate payment but does not receive
                                    the certificate after the applicable review
                                    and approval process, the student should
                                    contact Tech Monster support with the
                                    relevant payment and account information.
                                </p>

                                <Link to="/contact">
                                    Contact Support
                                </Link>
                            </div>

                        </div>

                        <p>
                            We will review the student's account, completion
                            status, payment status, and certificate request
                            and take the appropriate steps to resolve a valid
                            certificate-delivery issue.
                        </p>

                        <p>
                            A certificate-delivery or approval issue does not
                            automatically create a refund entitlement.
                        </p>

                    </section>


                    <section className="refund-policy-section">

                        <div className="refund-section-heading">
                            <span>05</span>
                            <h2>When a Refund Is Not Provided</h2>
                        </div>

                        <ul className="refund-list">

                            <li>
                                <FaCheckCircle />
                                <span>
                                    Change of mind after certificate payment.
                                </span>
                            </li>

                            <li>
                                <FaCheckCircle />
                                <span>
                                    Request to cancel a completed course or
                                    internship enrollment.
                                </span>
                            </li>

                            <li>
                                <FaCheckCircle />
                                <span>
                                    Failure to complete the applicable
                                    educational requirements.
                                </span>
                            </li>

                            <li>
                                <FaCheckCircle />
                                <span>
                                    Request for a refund instead of resolving
                                    a certificate-delivery issue through support.
                                </span>
                            </li>

                        </ul>

                    </section>


                    <section className="refund-policy-section">

                        <div className="refund-section-heading">
                            <span>06</span>
                            <h2>Payment Disputes & Exceptions</h2>
                        </div>

                        <div className="refund-warning">

                            <FaExclamationTriangle />

                            <p>
                                This policy does not limit any rights or
                                remedies that cannot legally be excluded under
                                applicable laws or valid payment-provider
                                dispute mechanisms.
                            </p>

                        </div>

                        <p>
                            If you believe a payment was processed incorrectly,
                            duplicated, unauthorized, or affected by a
                            technical issue, please contact Tech Monster
                            support as soon as possible so the matter can be
                            investigated.
                        </p>

                    </section>


                    <section className="refund-policy-section">

                        <div className="refund-section-heading">
                            <span>07</span>
                            <h2>How to Contact Us</h2>
                        </div>

                        <p>
                            For certificate-payment issues, account-related
                            concerns, or questions regarding this policy,
                            please contact Tech Monster through our Contact Us
                            page.
                        </p>

                        <Link
                            to="/contact"
                            className="refund-contact-button"
                        >
                            Contact Tech Monster
                        </Link>

                    </section>


                    <section className="refund-final-card">

                        <FaCertificate />

                        <h2>
                            Certificate Payment Notice
                        </h2>

                        <p>
                            Please make a certificate payment only after
                            confirming that you have completed the applicable
                            program and are eligible for certificate issuance.
                        </p>

                        <Link
                            to="/"
                            className="refund-home-button"
                        >
                            Return to Tech Monster
                        </Link>

                    </section>

                </motion.main>


                <footer className="refund-policy-footer">

                    <p>
                        © {new Date().getFullYear()} Tech Monster.
                        All rights reserved.
                    </p>

                    <div>

                        <Link to="/terms-and-conditions">
                            Terms & Conditions
                        </Link>

                        <span>•</span>

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


export default RefundCancellationPolicy;
