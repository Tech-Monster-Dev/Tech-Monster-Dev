import "./HelpSupport.css";
import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";


import {
    getMySupportConversation,
    getSupportMessages,
    sendSupportMessage,
    clearSupportConversation
} from "../../../services/api/support.service";

import { socket } from "../../../services/socket/socket";
import Spinner from "../../../features/dashboard/common/LoaderPage/Spinner";
import HelpChatHeader from "./components/HelpChatHeader";
import HelpChatMessages from "./components/HelpChatMessages";
import HelpChatInput from "./components/HelpChatInput";
import HelpWelcome from "./components/HelpWelcome";
import HelpClearWarning from "./components/HelpClearWarning";


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
    const location = useLocation();
    const navigate = useNavigate();

    const [conversation, setConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const isTypingRef = useRef(false);
    const pendingSupportReplyRef = useRef(null);
    const [supportStarted, setSupportStarted] = useState(false);
    const [showClearWarning, setShowClearWarning] = useState(false);

    const messagesEndRef = useRef(null);
    const chatInputRef = useRef(null);
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

    useEffect(() => {
        const notificationConversationId =
            location.state?.notificationConversationId;

        if (
            !notificationConversationId ||
            !conversation?._id
        ) {
            return;
        }

        if (
            String(conversation._id) !==
            String(notificationConversationId)
        ) {
            return;
        }

        navigate(location.pathname, {
            replace: true,
            state: {}
        });
    }, [
        conversation?._id,
        location.pathname,
        location.state?.notificationConversationId,
        navigate
    ]);

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

                conversationIdRef.current = String(
                    currentConversation._id
                );

                const messagesResponse = await getSupportMessages(
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

                const supportStartedKey =
                    "techMonsterSupportStarted_" +
                    currentUserId + "_" +
                    currentConversation._id;

                setSupportStarted(
                    Boolean(
                        messagesResponse?.messages?.length ||
                        localStorage.getItem(supportStartedKey) === "true"
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
    }, [currentUserId]);

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


        const handleSupportMessage = (incomingMessage) => {
            if (!incomingMessage) return;

            const messageConversationId = String(
                incomingMessage.supportConversation || ""
            );

            if (
                !conversationIdRef.current ||
                messageConversationId !== String(conversationIdRef.current)
            ) {
                return;
            }

            const isOwnMessage = String(
                incomingMessage.sender?._id ||
                incomingMessage.sender ||
                ""
            ) === currentUserId;

            if (!isOwnMessage && isTypingRef.current) {
                pendingSupportReplyRef.current = incomingMessage;
                return;
            }

            setMessages((previous) =>
                mergeSupportMessages(previous, incomingMessage)
            );
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

    const handleClearChat = () => {
        if (!conversation?._id || sending) {
            return;
        }

        setShowClearWarning(true);
    };

    const confirmClearChat = async () => {
        setShowClearWarning(false);

        try {
            setSending(true);

            await clearSupportConversation(
                conversation._id
            );

            localStorage.removeItem(
                "techMonsterSupportStarted_" +
                currentUserId + "_" +
                conversation._id
            );

            setMessages([]);
            setConversation(null);
            conversationIdRef.current = null;
            setSupportStarted(false);

            const conversationResponse = await getMySupportConversation();
            const newConversation = conversationResponse?.conversation;

            if (newConversation) {
                setConversation(
                    newConversation
                );

                conversationIdRef.current = String(
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


    const sendMessageText = async (text) => {
        const normalizedText = text?.trim();

        if (!normalizedText || !conversation?._id || sending) {
            return;
        }

        try {
            setSending(true);
            isTypingRef.current = true;
            setIsTyping(true);

            const response = await sendSupportMessage({
                conversationId: conversation._id,
                message: normalizedText
            });

            const sentMessage = response?.data;
            const autoReply = response?.autoReply;

            if (sentMessage) {
                setMessages((previous) =>
                    mergeSupportMessages(previous, sentMessage)
                );
            }

            if (response?.conversation) {
                setConversation(response.conversation);
            }

            if (autoReply) {
                await new Promise((resolve) =>
                    setTimeout(resolve, 2000)
                );

                setMessages((previous) =>
                    mergeSupportMessages(previous, autoReply)
                );
            }

            return response;
        } catch (error) {
            console.error("Failed to send support message:", error);
            return null;
        } finally {
            isTypingRef.current = false;
            setIsTyping(false);

            const pendingReply = pendingSupportReplyRef.current;
            pendingSupportReplyRef.current = null;

            if (pendingReply) {
                setMessages((previous) =>
                    mergeSupportMessages(previous, pendingReply)
                );
            }

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

        const response = await sendMessageText(text);

        if (response) {
            setInputMessage("");
        }

        requestAnimationFrame(() => {
            if (!sending) {
                chatInputRef.current?.focus();
            }
        });
    };

    const handleContinueSupport = () => {
        if (
            loading ||
            sending ||
            !conversation
        ) {
            return;
        }

        localStorage.setItem(
            "techMonsterSupportStarted_" +
            currentUserId + "_" +
            conversation._id,
            "true"
        );

        setSupportStarted(true);
    };

    return (
        <>
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

                    <HelpChatHeader
                        loading={loading}
                        sending={sending}
                        conversation={conversation}
                        supportStarted={supportStarted}
                        onClearChat={handleClearChat}
                    />

                    <div className="help-chat-messages">
                        {loading ? (
                            <Spinner
                                message="Loading support conversation..."
                                size={45}
                            />
                        ) : (
                            <>
                                {!supportStarted && (
                                    <HelpWelcome
                                        loading={loading}
                                        sending={sending}
                                        conversation={conversation}
                                        onContinue={handleContinueSupport}
                                        formatTime={formatTime}
                                    />
                                )}

                                <HelpChatMessages
                                    supportStarted={supportStarted}
                                    messages={messages}
                                    currentUserId={currentUserId}
                                    formatTime={formatTime}
                                    isTyping={isTyping}
                                />
                            </>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    <HelpChatInput
                        loading={loading}
                        sending={sending}
                        conversation={conversation}
                        supportStarted={supportStarted}
                        inputMessage={inputMessage}
                        onInputChange={setInputMessage}
                        onSendMessage={handleSendMessage}
                        inputRef={chatInputRef}
                    />
                </div>
            </motion.div>

            <HelpClearWarning
                open={showClearWarning}
                onConfirm={confirmClearChat}
                onCancel={() => setShowClearWarning(false)}
            />
        </>
    );
}

export default HelpSupport;