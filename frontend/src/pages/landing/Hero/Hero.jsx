import './Hero.css';

import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';

import api from "../../../services/api/axios";
import { API } from "../../../services/api/endpoints";


import { motion } from 'framer-motion';
import { FaArrowRight, FaPlayCircle, FaShieldAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { heroContent } from './HeroData';
import HeroImage from '../../../assets/logo/logo.webp';

import PublicButton from '../../../components/ui/Button/PublicButton';
import StatsCard from "../../../components/ui/Card/StatsCard";
import Spinner from '../../../features/dashboard/common/LoaderPage/Spinner';


const fadeUp = {
    hidden: {
        opacity: 0,
        y: 40,
    },
    show: (delay = 0) => ({
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.7,
            delay,
            ease: 'easeOut',
        },
    }),
};

function Hero() {

    const navigate = useNavigate();

    const [heroStats, setHeroStats] = useState({
        students: 0,
        internships: 0,
        courses: 0,
        admins: 0
    });

    const [statsLoading, setStatsLoading] = useState(true);

    useEffect(() => {

        const fetchHeroStats = async () => {

            try {

                const response = await api.get(
                    API.PUBLIC.HERO_STATS
                );

                if (response.data.success) {
                    setHeroStats(response.data.stats);
                }

            } catch (error) {

                console.error(
                    "Failed to fetch hero stats:",
                    error
                );
                toast.error("Failed to fetch hero stats")

            } finally {

                setStatsLoading(false);

            }

        };

        fetchHeroStats();

    }, []);


    return (
        <>
            <section className='hero' data-section='home'>

                <div className="hero-container">
                    {/* LEFT */}
                    <div className="hero-left">
                        <motion.span className='hero-badge' variants={fadeUp} initial='hidden' animate='show' custom={0}>{heroContent.badge}</motion.span>
                        <motion.h1
                            className="hero-title"
                            variants={fadeUp}
                            initial="hidden"
                            animate="show"
                            custom={0.2}
                        >
                            <span className="hero-title-main">
                                {heroContent.title}
                            </span>

                            <span className="hero-title-highlight">
                                <span className="hero-title-icon">
                                    <FaShieldAlt />
                                </span>
                                {heroContent.highlight}
                            </span>
                        </motion.h1>
                        <motion.p className='hero-description' variants={fadeUp} initial='hidden' animate='show' custom={0.4}>{heroContent.description}</motion.p>
                        <motion.div className='hero-buttons' variants={fadeUp} initial='hidden' animate='show' custom={0.6}>
                            <PublicButton
                                variant="primary"
                                size="medium"
                                icon={<FaArrowRight />}
                                iconPosition="right"
                                onClick={() => navigate('/signup')}
                            >
                                {heroContent.primaryButton}
                            </PublicButton>

                            <PublicButton
                                variant="outline"
                                background={false}
                                size="medium"
                                icon={<FaPlayCircle />}
                                iconPosition="right"
                                onClick={() => navigate('/learn-more')}
                            >
                                {heroContent.secondaryButton}
                            </PublicButton>
                        </motion.div>

                        <motion.div className='hero-stats' variants={fadeUp} initial='hidden' animate='show' custom={0.8}>
                            <StatsCard
                                count={statsLoading ? <Spinner size={45} /> : heroStats.students || 0}
                                title="Students"
                            />

                            <StatsCard
                                count={statsLoading ? <Spinner size={45} /> : heroStats.internships || 0}
                                title="Internships"
                            />

                            <StatsCard
                                count={statsLoading ? <Spinner size={45} /> : heroStats.courses || 0}
                                title="Courses"
                            />

                            <StatsCard
                                count={statsLoading ? <Spinner size={45} /> : heroStats.admins || 0}
                                title="Mentors"
                            />
                        </motion.div>
                    </div>

                    {/* RIGHT */}
                    <motion.div
                        className="hero-right"
                        initial={{ opacity: 0, x: 80 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <motion.div
                            className="hero-image-wrapper"
                            animate={{ y: [0, -30, 0] }}
                            transition={{
                                duration: 4,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                        >
                            <img
                                src={HeroImage}
                                alt="Hero image"
                            />
                        </motion.div>
                    </motion.div>
                </div>
            </section>
        </>
    )
}

export default Hero;