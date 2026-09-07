import "./Feedback.css";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { FaArrowRight } from "react-icons/fa";

import SectionHeader from "../../../components/ui/SectionHeader";
import FeedbackCard from "./components/FeedbackCard";
import PublicButton from "../../../components/ui/Button/PublicButton/PublicButton";

import { getWebsiteFeedback } from "../../../services/api/feedback.service";
import { socket } from "../../../services/socket/socket";
import useFeedbackAutoScroll from "./hooks/useFeedbackAutoScroll";

function Feedback() {
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

    return (
        <section className="section" id="feedback">
            <div id="feedback-page">
                <SectionHeader
                    badge="FEEDBACK"
                    title="What Our Students Say"
                    description="Real feedback from students helps us improve the Tech Monster experience."
                />

                <div id="feedback-content">
                    <div id="feedback-cards" ref={cardsRef}>
                        {loading && (
                            <p className="feedback-status">
                                Loading feedback...
                            </p>
                        )}

                        {!loading && feedback.length === 0 && (
                            <p className="feedback-status">
                                No public feedback available yet.
                            </p>
                        )}

                        {feedback.length > 0 && (
                            <div id="feedback-track">
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
                        id="feedback-cta"
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
                            size="medium"
                            icon={<FaArrowRight />}
                            iconPosition="right"
                            onClick={() => {
                                window.location.href = "/login";
                            }}
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
