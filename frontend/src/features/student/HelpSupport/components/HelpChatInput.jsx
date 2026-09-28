import { motion } from "framer-motion";
import { FiSend } from "react-icons/fi";

function HelpChatInput({
    loading,
    sending,
    conversation,
    supportStarted,
    inputMessage,
    onInputChange,
    onSendMessage
}) {
    return (
        <form
            className="help-chat-input-area"
            onSubmit={onSendMessage}
        >
            <input
                type="text"
                placeholder="Type your problem or question here..."
                value={inputMessage}
                disabled={
                    loading ||
                    sending ||
                    !conversation ||
                    !supportStarted
                }
                onChange={(e) =>
                    onInputChange(e.target.value)
                }
            />

            <motion.button
                type="submit"
                className="help-send-btn"
                disabled={
                    loading ||
                    sending ||
                    !inputMessage.trim() ||
                    !conversation ||
                    !supportStarted
                }
                whileHover={{
                    scale: 1.05
                }}
                whileTap={{
                    scale: 0.95
                }}
            >
                <FiSend />
            </motion.button>
        </form>
    );
}

export default HelpChatInput;
