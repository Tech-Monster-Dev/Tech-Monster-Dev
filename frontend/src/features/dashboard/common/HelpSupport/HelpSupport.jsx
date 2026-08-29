import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
    FiSend,
    FiShield,
    FiCheckCircle,
    FiTrash2
} from "react-icons/fi";

import {
    getMySupportConversation,
    getSupportMessages,
    sendSupportMessage,
    clearSupportConversation
} from "../../../../services/api/support.service";

import { socket } from "../../../../services/socket/socket";

import "./HelpSupport.css";

function formatTime(date) {
    if (!date) {
        return "";
    }

    return new Date(date).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
    });
}

const mergeSupportMessages = (
    previousMessages,
    incomingMessages
) => {
    const incoming =
        Array.isArray(incomingMessages)
            ? incomingMessages
            : [incomingMessages];

    const messageMap = new Map();

    [
        ...previousMessages,
        ...incoming
    ].forEach((message) => {
        if (!message?._id) {
            return;
        }

        messageMap.set(
            String(message._id),
            message
        );
    });

    return Array.from(
        messageMap.values()
    ).sort(
        (a, b) =>
            new Date(a.createdAt).getTime() -
            new Date(b.createdAt).getTime()
    );
};

function HelpSupport() {
    const [conversation, setConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);

    const messagesEndRef = useRef(null);
    const conversationIdRef = useRef(null);

    const currentUser = (() => {
        try {
            return JSON.parse(
                localStorage.getItem("user")
            );
        } catch {
            return null;
        }
    })();

    const currentUserId = String(
        currentUser?._id ||
        currentUser?.id ||
        ""
    );

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({
            behavior: "smooth"
        });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // ==========================================
    // LOAD SUPPORT CONVERSATION + MESSAGES
    // ==========================================

    useEffect(() => {
        let mounted = true;

        const loadSupport = async () => {
            try {
                setLoading(true);

                const conversationResponse =
                    await getMySupportConversation();

                const currentConversation =
                    conversationResponse?.conversation;

                if (!mounted || !currentConversation) {
                    return;
                }

                setConversation(
                    currentConversation
                );

                conversationIdRef.current =
                    String(
                        currentConversation._id
                    );

                const messagesResponse =
                    await getSupportMessages(
                        currentConversation._id
                    );

                if (!mounted) {
                    return;
                }

                setMessages((previousMessages) =>
                    mergeSupportMessages(
                        previousMessages,
                        messagesResponse?.messages || []
                    )
                );
            } catch (error) {
                console.error(
                    "Failed to load support conversation:",
                    error
                );
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };

        loadSupport();

        return () => {
            mounted = false;
        };
    }, []);

    // ==========================================
    // SUPPORT REALTIME SOCKET
    // ==========================================

    useEffect(() => {
        if (!currentUserId) {
            return;
        }

        const handleConnect = () => {
            socket.emit(
                "join",
                currentUserId
            );
        };

        const handleSupportMessage = (
            incomingMessage
        ) => {
            if (!incomingMessage) {
                return;
            }

            const messageConversationId =
                String(
                    incomingMessage.supportConversation ||
                    ""
                );

            if (
                !conversationIdRef.current ||
                messageConversationId !==
                    String(conversationIdRef.current)
            ) {
                return;
            }

            setMessages((previous) => {
                const exists = previous.some(
                    (item) =>
                        String(item._id) ===
                        String(incomingMessage._id)
                );

                if (exists) {
                    return previous;
                }

                return mergeSupportMessages(
                    previous,
                    incomingMessage
                );
            });
        };

        socket.on(
            "connect",
            handleConnect
        );

        socket.on(
            "supportMessage",
            handleSupportMessage
        );

        const handleConversationUpdated = (
            updatedConversation
        ) => {
            if (
                !updatedConversation?._id ||
                String(updatedConversation._id) !==
                    String(conversationIdRef.current)
            ) {
                return;
            }

            setConversation(updatedConversation);

        };

        socket.on(
            "supportConversationUpdated",
            handleConversationUpdated
        );


        if (socket.connected) {
            socket.emit(
                "join",
                currentUserId
            );
        } else {
            socket.connect();
        }

        return () => {
            socket.off(
                "connect",
                handleConnect
            );

            socket.off(
                "supportMessage",
                handleSupportMessage
            );

            socket.off(
                "supportConversationUpdated",
                handleConversationUpdated
            );
        };
    }, [
        currentUserId,
        conversationIdRef
    ]);

    // ==========================================
    // SEND SUPPORT MESSAGE
    // ==========================================

    const handleClearChat = async () => {
        if (!conversation?._id || sending) {
            return;
        }

        const confirmed =
            window.confirm(
                "Are you sure you want to clear this support chat?"
            );

        if (!confirmed) {
            return;
        }

        try {
            setSending(true);

            await clearSupportConversation(
                conversation._id
            );

            setMessages([]);
            setConversation(null);
            conversationIdRef.current = null;

            const conversationResponse =
                await getMySupportConversation();

            const newConversation =
                conversationResponse?.conversation;

            if (newConversation) {
                setConversation(
                    newConversation
                );

                conversationIdRef.current =
                    String(
                        newConversation._id
                    );
            }
        } catch (error) {
            console.error(
                "Failed to clear support chat:",
                error
            );
        } finally {
            setSending(false);
        }
    };

    const sendMessageText = async (
        text
    ) => {
        const normalizedText =
            text?.trim();

        if (
            !normalizedText ||
            !conversation?._id ||
            sending
        ) {
            return;
        }

        try {
            setSending(true);

            const response =
                await sendSupportMessage({
                    conversationId:
                        conversation._id,
                    message: normalizedText
                });

            const sentMessage =
                response?.data;

            const messagesToAdd = [
                sentMessage,
                response?.autoReply
            ].filter(Boolean);

            if (messagesToAdd.length) {
                setMessages((previous) =>
                    mergeSupportMessages(
                        previous,
                        messagesToAdd
                    )
                );
            }

            if (response?.conversation) {
                setConversation(
                    response.conversation
                );
            }

            return response;
        } catch (error) {
            console.error(
                "Failed to send support message:",
                error
            );

            return null;
        } finally {
            setSending(false);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();

        const text =
            inputMessage.trim();

        if (
            !text ||
            !conversation?._id ||
            sending
        ) {
            return;
        }

        const response =
            await sendMessageText(text);

        if (response) {
            setInputMessage("");
        }
    };

    const handleContinueSupport = async () => {
        if (
            !conversation?._id ||
            sending
        ) {
            return;
        }

        await sendMessageText(
            "Continue with this support chat"
        );
    };

    return (
        <motion.div
            className="help-support-container"
            initial={{
                opacity: 0,
                y: 15
            }}
            animate={{
                opacity: 1,
                y: 0
            }}
            exit={{
                opacity: 0
            }}
            transition={{
                duration: 0.3
            }}
        >
            <div className="help-chat-box-wrapper">

                {/* Chat Header */}
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
                        onClick={handleClearChat}
                        disabled={
                            loading ||
                            sending ||
                            !conversation
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

                {/* Messages Body */}
                <div className="help-chat-messages">

                    {loading ? (
                        <div className="help-support-loading">
                            Loading support conversation...
                        </div>
                    ) : (
                        <>
                            <motion.div
                                    className="help-msg-bubble-wrapper received"
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
                                                onClick={handleContinueSupport}
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
                                                {formatTime(
                                                    new Date()
                                                )}
                                            </span>
                                        </div>
                                    </div>
                            </motion.div>

                            {messages.map((msg) => {
                                const senderId =
                                    String(
                                        msg.sender?._id ||
                                        msg.sender ||
                                        ""
                                    );

                                const isStudent =
                                    senderId ===
                                    currentUserId;

                                return (
                                    <motion.div
                                        key={msg._id}
                                        className={`help-msg-bubble-wrapper ${
                                            isStudent
                                                ? "sent"
                                                : "received"
                                        }`}
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
                                                    {formatTime(
                                                        msg.createdAt
                                                    )}
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
                    )}

                    <div ref={messagesEndRef} />

                </div>

                {/* Input Footer */}
                <form
                    className="help-chat-input-area"
                    onSubmit={handleSendMessage}
                >
                    <input
                        type="text"
                        placeholder="Type your problem or question here..."
                        value={inputMessage}
                        disabled={
                            loading ||
                            sending ||
                            !conversation
                        }
                        onChange={(e) =>
                            setInputMessage(
                                e.target.value
                            )
                        }
                    />

                    <motion.button
                        type="submit"
                        className="help-send-btn"
                        disabled={
                            loading ||
                            sending ||
                            !inputMessage.trim() ||
                            !conversation
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

            </div>
        </motion.div>
    );
}

export default HelpSupport;
