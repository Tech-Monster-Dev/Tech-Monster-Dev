import './Navbar.css';

import { useNavigate } from 'react-router-dom';
import { FaBars, FaTimes } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { navLinks } from './Navbardata.js';
import useAuth from '../../shared/hooks/useAuth';

import Systembar from "../common/navbar/SystemBar";

import logo from "../../assets/logo/logo.webp"
import PublicButton from '../ui/Button/PublicButton/PublicButton.jsx';

function Navbar() {

    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();

    const [isOpen, setIsOpen] = useState(false);
    const [activeLink, setActiveLink] = useState("home");

    const userName = user?.username || '';
    const capitalName = userName.toUpperCase() || userName;


    const handleSignUp = () => {
        navigate("/signup")
        setIsOpen(false)
    }

    const handleSignIn = () => {
        if (isAuthenticated === false) {
            navigate("/login");
            return;
        }

        if (user?.role === "student") {
            navigate("/student");
        } else if (user?.role === "admin") {
            navigate("/admin");
        } else {
            navigate("/login");
        }

        setIsOpen(false)
    };

    const scrollToSection = (section) => {
        const target = document.querySelector(`[data-section="${section}"]`);
        const navbar = document.querySelector("[data-navbar]");

        if (target) {
            const navbarHeight = navbar?.getBoundingClientRect().height ?? 0;
            const targetTop = target.getBoundingClientRect().top + window.scrollY;

            window.scrollTo({
                top: Math.max(0, targetTop - navbarHeight),
                behavior: "smooth",
            });

            setActiveLink(section);
        }

        setIsOpen(false);
    };

    useEffect(() => {
        const sections = document.querySelectorAll("[data-section]");

        const observer = new IntersectionObserver(
            (entries) => {
                const visibleSection = entries
                    .filter((entry) => entry.isIntersecting)
                    .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

                if (visibleSection) {
                    setActiveLink(visibleSection.target.dataset.section);
                }
            },
            { threshold: [0.35, 0.6] },
        );

        sections.forEach((section) => observer.observe(section));

        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        document.body.style.overflow = isOpen ? "hidden" : "";

        return () => {
            document.body.style.overflow = "";
        };
    }, [isOpen]);


    return (
        <>
            <motion.nav
                data-navbar
                className='navbar-wrapper'
                initial={{ y: -80, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6 }}
            >
                <Systembar user={capitalName} />

                <div className='navbar'>
                    <button
                        type='button'
                        className='navbar-logo'
                        onClick={() => scrollToSection('home')}
                        aria-label='Go to Home'
                    >
                        <img className='navbar-logo-img' src={logo} alt='Tech monster Logo' />

                        <div>
                            <h2 className='navbar-logo-title'>Tech <span className='navbar-logo-title-accent'>Monster</span></h2>
                        </div>
                    </button>

                    <div className='navbar-toggle'>
                        <button
                            type='button'
                            className='navbar-toggle-menu-button'
                            onClick={() => setIsOpen(true)}
                            aria-label='Open navigation menu'
                        >
                            <FaBars />
                        </button>
                    </div>

                    <div className='navbar-right'>
                        {navLinks.map((link) => (
                            <button
                                type='button'
                                className={`navbar-link ${activeLink === link.section ? 'active' : ''}`}
                                key={link.id}
                                onClick={() => scrollToSection(link.section)}
                            >
                                {link.title}
                            </button>
                        ))}

                        <div className='navbar-action-buttons'>
                            <PublicButton
                                variant='outline'
                                background={false}
                                size='medium'
                                onClick={handleSignIn}
                            >
                                Sign in
                            </PublicButton>

                            <PublicButton
                                variant='primary'
                                size='medium'
                                onClick={() => navigate('/signup')}
                            >
                                Get Started
                            </PublicButton>
                        </div>
                    </div>
                </div>
            </motion.nav>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            className='navbar-sidebar-overlay'
                            onClick={() => setIsOpen(false)}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        />

                        <motion.div
                            className='navbar-sidebar'
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ duration: 0.35, ease: 'easeInOut' }}
                        >
                            <div className="flex flex-col gap-3">

                                <button
                                    type='button'
                                    className='navbar-sidebar-close-button'
                                    onClick={() => setIsOpen(false)}
                                    aria-label='Close navigation menu'
                                >
                                    <FaTimes />
                                </button>

                                {navLinks.map((link) => (
                                    <button
                                        type='button'
                                        className={`navbar-sidebar-link ${activeLink === link.section ? 'navbar-sidebar-link-active' : ''}`}
                                        key={link.id}
                                        onClick={() => scrollToSection(link.section)}
                                    >
                                        {link.title}
                                    </button>
                                ))}
                            </div>

                            <div className="flex flex-col gap-3">
                                <PublicButton
                                    variant='primary'
                                    size='medium'
                                    onClick={() => handleSignUp()}
                                >
                                    Get Started
                                </PublicButton>

                                <PublicButton
                                    variant='outline'
                                    background={false}
                                    size='medium'
                                    onClick={() => handleSignIn()}
                                >
                                    Sign In
                                </PublicButton>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    )

}

export default Navbar;