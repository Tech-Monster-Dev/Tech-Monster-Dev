import './Hero.css';

import { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';

import api from "../../../services/api/axios";
import { API } from "../../../services/api/endpoints";


import { FaArrowRight, FaPlayCircle, FaShieldAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { heroContent } from './HeroData';

import PublicButton from '../../../components/ui/Button/PublicButton';
import StatsCard from "../../../components/ui/Card/StatsCard";
import Spinner from '../../../features/dashboard/common/LoaderPage/Spinner';


function Hero() {

    const router = useRouter();

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
                        <span className='hero-badge'>{heroContent.badge}</span>
                        <h1
                            className="hero-title"
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
                        </h1>
                        <p className='hero-description'>{heroContent.description}</p>
                        <div className='hero-buttons'>
                            <PublicButton
                                variant="primary"
                                size="medium"
                                icon={<FaArrowRight />}
                                iconPosition="right"
                                onClick={() => router.push('/auth/signup')}
                            >
                                {heroContent.primaryButton}
                            </PublicButton>

                            <PublicButton
                                variant="outline"
                                background={false}
                                size="medium"
                                icon={<FaPlayCircle />}
                                iconPosition="right"
                                onClick={() => router.push('/learn-more')}
                            >
                                {heroContent.secondaryButton}
                            </PublicButton>
                        </div>

                        <div className='hero-stats'>
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
                        </div>
                    </div>

                    {/* RIGHT */}
                    <div
                        className="hero-right"
                    >
                        <div
                            className="hero-image-wrapper"
                        >
                            <img
                                src="/assets/logo/logo-optimized.webp"
                                alt="Tech Monster cybersecurity learning platform logo"
                                width={460}
                                height={460}
                                decoding="async"
                            />
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}

export default Hero;