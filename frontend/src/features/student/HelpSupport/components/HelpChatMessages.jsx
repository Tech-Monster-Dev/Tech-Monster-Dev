import { motion } from "framer-motion";
import { FiCheckCircle } from "react-icons/fi";

function HelpChatMessages({
    supportStarted,
    messages,
    currentUserId,
    formatTime
}) {
    return (
        <>
            {supportStarted && (
                <motion.div
                    className="help-msg-bubble-wrapper help-received"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="help-msg-bubble">
                        <p>
                            Hi! I’m Tech Monster Support Assistant. Tell me your issue or question, and I’ll helpyou.
                        </p>
                        <div className="help-msg-meta">
                            <span>
                                {formatTime(new Date())}
                            </span>
                        </div>
                    </div>
                </motion.div>
            )}

            {messages.map((msg) => {
                const senderId = String(
                    msg.sender?._id ||
                    msg.sender ||
                    ""
                );

                const isStudent =
                    senderId === currentUserId;

                return (
                    <motion.div
                        key={msg._id}
                        className={'help-msg-bubble-wrapper ' + (isStudent ? 'help-sent' : 'help-received')}
                        initial={{
                            opacity: 0,
                            y: 10
                        }}
                        animate={{
                            opacity: 1,
                            y: 0
                        }}
                        transition={{
                            duration: 0.2
                        }}
                    >
                        <div className="help-msg-bubble">
                            <p>
                                {msg.message}
                            </p>

                            <div className="help-msg-meta">
                                <span>
                                    {formatTime(msg.createdAt)}
                                </span>

                                {isStudent && (
                                    <FiCheckCircle
                                        className="help-read-check"
                                    />
                                )}
                            </div>
                        </div>
                    </motion.div>
                );
            })}
        </>
    );
}

export default HelpChatMessages;