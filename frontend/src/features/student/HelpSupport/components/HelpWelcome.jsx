import { motion } from "framer-motion";

function HelpWelcome({
    loading,
    sending,
    conversation,
    onContinue,
    formatTime
}) {
    return (
        <motion.div
            className="help-msg-bubble-wrapper help-received"
            initial={{
                opacity: 0,
                y: 10
            }}
            animate={{
                opacity: 1,
                y: 0
            }}
        >
            <div className="help-msg-bubble help-welcome-bubble">
                <p>
                    Hello! Welcome to Tech Monster Support.
                </p>

                <p className="help-welcome-text">
                    If you have a major issue, contact our Admin directly on WhatsApp. For a smaller issue, continue with this support chat and our support assistant will help you.
                </p>

                <div className="help-welcome-actions">
                    <a
                        href="https://wa.me/918984457601?text=Hello%20Tech%20Monster"
                        target="_blank"
                        rel="noreferrer"
                        className="help-whatsapp-btn"
                    >
                        WhatsApp Admin
                    </a>

                    <motion.button
                        type="button"
                        className="help-continue-btn"
                        onClick={onContinue}
                        disabled={
                            loading ||
                            sending ||
                            !conversation
                        }
                        whileHover={{
                            scale: 1.03
                        }}
                        whileTap={{
                            scale: 0.97
                        }}
                        aria-label="Continue with this support chat"
                    >
                        Continue
                        <span aria-hidden="true">
                            →
                        </span>
                    </motion.button>
                </div>

                <div className="help-msg-meta">
                    <span>
                        {formatTime(new Date())}
                    </span>
                </div>
            </div>
        </motion.div>
    );
}

export default HelpWelcome;