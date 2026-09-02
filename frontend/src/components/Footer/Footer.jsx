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
    const navigate = useNavigate();

    return (

        <footer id="footer">
            <div id="footer-container">
                {/* Brand Section */}
                <div id="footer-brand">
                    <h2>Tech <span>Monster</span></h2>
                    <p>Building technical skills through real-world projects, mentorship and practical learning programs.</p>


                    <div id="social">

                        <a><FaGithub /></a>
                        <a><FaLinkedin /></a>
                        <a><FaTwitter /></a>

                        <a href="https://www.instagram.com/tech_m0nster?igsh=MTdnanFlOG00YnJuNw==" target="_blank"><FaInstagram /></a>
                    </div>
                </div>

                {/* Links */}
                <div id="footer-links">
                    <h3>Platform</h3>
                    <a href="#">Home</a>

                    <a href="#about">About</a>

                    <a href="#contact">Contact</a>
                </div>

                {/* Legal */}
                <div id="footer-legal">
                    <h3>Legal</h3>
                    <a href="/terms-and-conditions">Terms & Conditions</a>
                    <a href="/privacy-policy">Privacy Policy</a>
                    <a href="/refund-and-cancellation">Refund & Cancellation</a>
                    <a href="/contact">Contact Us</a>
                </div>

                {/* Newsletter */}
                <div id="footer-news">
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

                <div id="footerLogo" style={{ marginLeft: "5rem" }}>
                    <img src={logoImg} alt="Footer logo" />
                </div>
            </div>

            <div id="footer-bottom">
                <p>© 2026 Tech Monster. All Rights Reserved.</p>
                <div id="vrLine"></div>
                <p>Code. Secure. Solve.</p>
            </div>

        </footer>
    )
}



export default Footer;