import { motion } from "framer-motion";
import { FiShield, FiTrash2 } from "react-icons/fi";

function HelpChatHeader({
    loading,
    sending,
    conversation,
    supportStarted,
    onClearChat
}) {
    return (
        <div className="help-chat-header">
            <div className="admin-profile-meta">
                <div className="admin-avatar-container">
                    <FiShield className="admin-shield-icon" />
                    <span className="online-indicator"></span>
                </div>

                <div>
                    <h3>
                        Tech Monster Admin Support
                    </h3>

                    <span className="support-status">
                        Active 24/7 • Usually replies instantly
                    </span>
                </div>
            </div>

            <motion.button
                type="button"
                className="help-clear-chat-btn"
                onClick={onClearChat}
                disabled={
                    loading ||
                    sending ||
                    !conversation ||
                    !supportStarted
                }
                title="Clear Chat"
                aria-label="Clear support chat"
                whileHover={{
                    scale: 1.05
                }}
                whileTap={{
                    scale: 0.95
                }}
            >
                <FiTrash2 />
            </motion.button>
        </div>
    );
}

export default HelpChatHeader;