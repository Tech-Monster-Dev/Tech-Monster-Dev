import {
    FaGithub,
    FaLinkedin,
    FaTwitter,
    FaInstagram,
} from "react-icons/fa";

import { useNavigate } from "react-router-dom";

import "./Footer.css";


import logoImg from "../../assets/logo/logo.png"
import PublicButton from '../../components/ui/Button/PublicButton';


function Footer() {
    const scrollToSection = (section) => {
        const target = document.querySelector("[data-section=\"" + section + "\"]");
        const navbar = document.querySelector(".navbar");
        if (target == null) return;
        const navbarHeight = navbar?.getBoundingClientRect().height ?? 0;
        const targetTop = target.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({ top: Math.max(0, targetTop - navbarHeight), behavior: "smooth" });
    };
    const navigate = useNavigate();

    return (

        <footer className="footer">
            <div className="footer-container">
                {/* Brand Section */}
                <div className="footer-brand">
                    <h2>Tech <span>Monster</span></h2>
                    <p>Building technical skills through real-world projects, mentorship and practical learning programs.</p>


                    <div className="social">

                        <a className="social-link" aria-label="GitHub"><FaGithub /></a>
                        <a className="social-link" aria-label="LinkedIn"><FaLinkedin /></a>
                        <a className="social-link" aria-label="Twitter"><FaTwitter /></a>

                        <a className="social-link" href="https://www.instagram.com/tech_m0nster?igsh=MTdnanFlOG00YnJuNw==" target="_blank" rel="noreferrer" aria-label="Instagram"><FaInstagram /></a>
                    </div>
                </div>

                {/* Links */}
                <div className="footer-links">
                    <h3>Platform</h3>
                    <button type="button" onClick={() => scrollToSection("home")}>Home</button>

                    <button type="button" onClick={() => scrollToSection("about")}>About</button>

                    <button type="button" onClick={() => scrollToSection("contact")}>Contact</button>
                </div>

                {/* Legal */}
                <div className="footer-legal">
                    <h3>Legal</h3>
                    <a href="/terms-and-conditions">Terms & Conditions</a>
                    <a href="/privacy-policy">Privacy Policy</a>
                    <a href="/refund-and-cancellation">Refund & Cancellation</a>
                    <a href="/contact">Contact Us</a>
                </div>

                {/* Newsletter */}
                <div className="footer-news">
                    <h3>Join Us</h3>
                    <p>Get learning & training updates</p>
                    <PublicButton
                        variant="primary"
                        size="medium"
                        onClick={() => navigate('/signup')}
                    >
                        Get Started
                    </PublicButton>
                </div>

                <div className="footer-logo">
                    <img src={logoImg} alt="Footer logo" />
                </div>
            </div>

            <div className="footer-bottom">
                <p>© 2026 Tech Monster. All Rights Reserved.</p>
                <div className="footer-divider" aria-hidden="true"></div>
                <p>Code. Secure. Solve.</p>
            </div>

        </footer>
    )
}



export default Footer;