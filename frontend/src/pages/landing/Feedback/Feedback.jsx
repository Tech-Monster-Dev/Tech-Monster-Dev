import "./Feedback.css";

import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaArrowRight } from "react-icons/fa";

import SectionHeader from "../../../components/ui/SectionHeader";
import FeedbackCard from "./components/FeedbackCard";
import PublicButton from "../../../components/ui/Button/PublicButton/PublicButton";
import EmptyState from "../../../components/ui/EmptyState";
import Spinner from "../../../features/dashboard/common/LoaderPage/Spinner";

import { getWebsiteFeedback } from "../../../services/api/feedback.service";
import { socket } from "../../../services/socket/socket";
import useFeedbackAutoScroll from "./hooks/useFeedbackAutoScroll";
import useAuth from '../../../shared/hooks/useAuth'; 

function Feedback() {
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();
    const [feedback, setFeedback] = useState([]);
    const [loading, setLoading] = useState(true);
    const cardsRef = useRef(null);

    useFeedbackAutoScroll(cardsRef, feedback.length);

    useEffect(() => {
        let mounted = true;

        const loadFeedback = async () => {
            try {
                const response = await getWebsiteFeedback();

                if (mounted) {
                    setFeedback(response?.feedback || []);
                }
            } catch (error) {
                console.error("Failed to load website feedback:", error);
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };

        const handleFeedbackCreated = (payload) => {
            const item = payload?.feedback;

            if (!item || item.type !== "website") {
                return;
            }

            setFeedback((current) => {
                if (current.some((feedbackItem) => feedbackItem._id === item._id)) {
                    return current;
                }

                return [item, ...current].slice(0, 5);
            });
        };

        loadFeedback();

        socket.on("feedbackCreated", handleFeedbackCreated);

        if (!socket.connected) {
            socket.connect();
        }

        return () => {
            mounted = false;
            socket.off("feedbackCreated", handleFeedbackCreated);
        };
    }, []);

    const handleNavigateFeedbackPage = () => {
        if (!isAuthenticated) {
            navigate("/login");
        }

        if (user?.role === "student") {
            navigate("/student/feedback");
        } else if(user?.role === "admin") {
            navigate("/admin/feedback");
        } else(
            navigate("/login")
        )
    }

    return (
        <section className="section" data-section="feedback">
            <div className="landing-feedback-page">
                <SectionHeader
                    badge="FEEDBACK"
                    title="What Our Students Say"
                    description="Real feedback from students helps us improve the Tech Monster experience."
                />

                <div className="feedback-content">
                    <div className="feedback-cards" ref={cardsRef}>
                        {loading && (
                            <Spinner message="Loading feedback..." size={60} />
                        )}
                        {!loading && feedback.length === 0 && (
                            <EmptyState
                                paragraph="No public feedback available yet." 
                            />
                        )}

                        {feedback.length > 0 && (
                            <div className="feedback-track">
                                <div className={`feedback-track-group ${feedback.length === 1 ? "single-feedback-group" : ""}`}>
                                    {feedback.map((item) => (
                                        <FeedbackCard
                                            key={'primary-' + item._id}
                                            feedback={item}
                                        />
                                    ))}
                                </div>

                                {feedback.length > 1 && (
                                    <>
                                        <div
                                            className="feedback-track-group feedback-duplicate-group"
                                            aria-hidden="true"
                                        >
                                            {feedback.map((item) => (
                                                <FeedbackCard
                                                    key={'duplicate-' + item._id}
                                                    feedback={item}
                                                />
                                            ))}
                                        </div>
                                        <div
                                            className="feedback-track-group feedback-duplicate-group"
                                            aria-hidden="true"
                                        >
                                            {feedback.map((item) => (
                                                <FeedbackCard
                                                    key={'loop-' + item._id}
                                                    feedback={item}
                                                />
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    <motion.div
                        className="feedback-cta"
                        initial={{ opacity: 0, y: 25 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <p>
                            Your experience can help us make Tech Monster better.
                        </p>

                        <PublicButton
                            variant="outline"
                            background={false}
                            size="medium"
                            icon={<FaArrowRight />}
                            iconPosition="right"
                            onClick={() => handleNavigateFeedbackPage()}
                        >
                            Share Your Feedback
                        </PublicButton>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}

export default Feedback;
