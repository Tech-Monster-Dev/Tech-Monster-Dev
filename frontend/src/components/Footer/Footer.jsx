import "./Footer.css";
import {
    FaGithub,
    FaLinkedin,
    FaTwitter,
    FaInstagram,
} from "react-icons/fa";

import { useNavigate } from "react-router-dom";


import logoImg from "../../assets/logo/logo.webp";
import PublicButton from '../../components/ui/Button/PublicButton';


function Footer() {
    const scrollToSection = (section) => {
        const target = document.querySelector("[data-section=\"" + section + "\"]");
        const navbar = document.querySelector("[data-navbar]");
        if (target == null) return;
        const navbarHeight = navbar?.getBoundingClientRect().height ?? 0;
        const targetTop = target.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({ top: Math.max(0, targetTop - navbarHeight), behavior: "smooth" });
    };
    const navigate = useNavigate();

    return (

        <footer className="footer">
            <div className="footer-content">
                {/* Brand Section */}
                <div className="footer-brand">
                    <h2 className="footer-heading">Tech <span className="footer-heading-accent">Monster</span></h2>
                    <p className="footer-description">Building technical skills through real-world projects, mentorship and practical learning programs.</p>

                    <div className="footer-social">

                        <a className="footer-social-link" aria-label="GitHub"><FaGithub /></a>
                        <a className="footer-social-link" aria-label="LinkedIn"><FaLinkedin /></a>
                        <a className="footer-social-link" aria-label="Twitter"><FaTwitter /></a>

                        <a className="footer-social-link" href="https://www.instagram.com/tech_m0nster?igsh=MTdnanFlOG00YnJuNw==" target="_blank" rel="noreferrer" aria-label="Instagram"><FaInstagram /></a>
                    </div>
                </div>

                {/* Links */}
                <div className="footer-links">
                    <h3 className="footer-section-title">Platform</h3>
                    <button className="footer-link" type="button" onClick={() => scrollToSection("home")}>Home</button>

                    <button className="footer-link" type="button" onClick={() => scrollToSection("about")}>About</button>

                    <button className="footer-link" type="button" onClick={() => scrollToSection("contact")}>Contact</button>
                </div>

                {/* Legal */}
                <div className="footer-legal">
                    <h3 className="footer-section-title">Legal</h3>
                    <a className="footer-link" href="/terms-and-conditions">Terms & Conditions</a>
                    <a className="footer-link" href="/privacy-policy">Privacy Policy</a>
                    <a className="footer-link" href="/refund-and-cancellation">Refund & Cancellation</a>
                    <a className="footer-link" href="/contact">Contact Us</a>
                </div>

                {/* Newsletter */}
                <div className="footer-news">
                    <h3 className="footer-section-title">Join Us</h3>
                    <p className="footer-news-description">Get learning & training updates</p>
                    <PublicButton
                        variant="primary"
                        size="medium"
                        onClick={() => navigate('/signup')}
                    >
                        Get Started
                    </PublicButton>
                </div>

                <div className="footer-logo">
                    <img className="footer-logo-image" src={logoImg} alt="Footer logo" />
                </div>
            </div>

            <div className="footer-bottom">
                <p>© 2026 Tech Monster. All Rights Reserved.</p>
                <div className="footer-divider" aria-hidden="true"></div>
                <p className="footer-bottom-text">Code. Secure. Solve.</p>
            </div>

        </footer>
    )
}



export default Footer;
