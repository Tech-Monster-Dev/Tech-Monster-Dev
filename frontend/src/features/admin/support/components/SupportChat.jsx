import "./SupportChat.css";

import { useEffect, useRef, useState } from "react";
import {
    FiArrowLeft,
    FiSend,
    FiUser
} from "react-icons/fi";

import {
    getSupportMessages,
    sendSupportMessage,
    updateSupportConversation
} from "../../../../services/api/support.service";

import { socket } from "../../../../services/socket/socket";

const getUserName = (user) => {
    if (!user) {
        return "Unknown User";
    }

    return [
        user.firstName,
        user.lastName
    ]
        .filter(Boolean)
        .join(" ")
        .trim() || user.email || "User";
};

const formatTime = (date) => {
    if (!date) {
        return "";
    }

    const value = new Date(date);

    if (Number.isNaN(value.getTime())) {
        return "";
    }

    return value.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
    });
};

export default function SupportChat({
    conversation,
    currentUser,
    onBack
}) {

    const [messages, setMessages] = useState([]);
    const [text, setText] = useState("");
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState("");
    const [status, setStatus] = useState(
        conversation?.status || "open"
    );

    const messagesRef = useRef(null);

    const student = conversation?.student;

    const scrollToBottom = () => {
        requestAnimationFrame(() => {
            if (messagesRef.current) {
                messagesRef.current.scrollTop =
                    messagesRef.current.scrollHeight;
            }
        });
    };

    useEffect(() => {

        if (!conversation?._id) {
            return;
        }

        const loadMessages = async () => {

            try {

                setLoading(true);
                setError("");

                const data =
                    await getSupportMessages(
                        conversation._id
                    );

                setMessages(
                    Array.isArray(data?.messages)
                        ? data.messages
                        : []
                );

            } catch (err) {

                console.error(
                    "Failed to load support messages:",
                    err
                );

                setError(
                    err?.response?.data?.message ||
                    "Failed to load support messages."
                );

            } finally {

                setLoading(false);

            }
        };

        loadMessages();

    }, [conversation?._id]);

    useEffect(() => {

        if (!conversation?._id) {
            return;
        }

        const handleSupportMessage = (message) => {

            if (
                String(message?.supportConversation) !==
                String(conversation._id)
            ) {
                return;
            }

            setMessages((previous) => {

                if (
                    previous.some(
                        (item) =>
                            item._id === message._id
                    )
                ) {
                    return previous;
                }

                return [
                    ...previous,
                    message
                ];
            });

        };

        socket.on(
            "supportMessage",
            handleSupportMessage
        );

        return () => {
            socket.off(
                "supportMessage",
                handleSupportMessage
            );
        };

    }, [conversation?._id]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSubmit = async (event) => {

        event.preventDefault();

        const value = text.trim();

        if (!value || sending) {
            return;
        }

        try {

            setSending(true);

            const data =
                await sendSupportMessage({
                    conversationId:
                        conversation._id,
                    message: value
                });

            if (data?.data) {

                setMessages((previous) => {

                    if (
                        previous.some(
                            (item) =>
                                item._id ===
                                data.data._id
                        )
                    ) {
                        return previous;
                    }

                    return [
                        ...previous,
                        data.data
                    ];
                });

            }

            setText("");

        } catch (err) {

            console.error(
                "Failed to send support message:",
                err
            );

            setError(
                err?.response?.data?.message ||
                "Failed to send message."
            );

        } finally {

            setSending(false);

        }
    };

    const handleStatusChange = async (event) => {
        const status = event.target.value;

        try {
            setError("");

            const response =
                await updateSupportConversation(
                    conversation._id,
                    { status }
                );

            if (response?.conversation) {
                setStatus(
                    response.conversation.status
                );
            }

        } catch (err) {
            console.error(
                "Failed to update support status:",
                err
            );

            setError(
                err?.response?.data?.message ||
                "Failed to update support status."
            );
        }
    };

    return (
        <section className="support-chat">

            <header className="support-chat__header">

                <button
                    type="button"
                    className="support-chat__back"
                    onClick={onBack}
                    aria-label="Back to support inbox"
                >
                    <FiArrowLeft />
                </button>

                <div className="support-chat__avatar">

                    {student?.avatar ? (
                        <img
                            src={student.avatar}
                            alt={getUserName(student)}
                        />
                    ) : (
                        <FiUser />
                    )}

                </div>

                <div className="support-chat__user">

                    <h2>
                        {getUserName(student)}
                    </h2>

                    {student?.email && (
                        <span>
                            {student.email}
                        </span>
                    )}

                </div>

                {String(currentUser?.role || "").toLowerCase() === "admin" ? (
                    <select
                        className={`support-chat__status support-chat__status--${status}`}
                        value={status}
                        onChange={handleStatusChange}
                    >
                        <option value="open">Open</option>
                        <option value="pending">Pending</option>
                        <option value="resolved">Resolved</option>
                    </select>
                ) : (
                    <span
                        className={`support-chat__status support-chat__status--${status}`}
                    >
                        {status}
                    </span>
                )}

            </header>

            <div
                className="support-chat__messages"
                ref={messagesRef}
            >

                {loading ? (

                    <div className="support-chat__state">
                        Loading messages...
                    </div>

                ) : error && messages.length === 0 ? (

                    <div className="support-chat__state support-chat__state--error">
                        {error}
                    </div>

                ) : messages.length === 0 ? (

                    <div className="support-chat__state">
                        No messages yet.
                    </div>

                ) : (

                    messages.map((message) => {

                        const isMine =
                            String(
                                message.sender?._id ||
                                message.sender
                            ) ===
                            String(
                                currentUser?._id ||
                                currentUser?.id
                            );

                        return (
                            <div
                                key={message._id}
                                className={`support-chat__message ${
                                    isMine
                                        ? "support-chat__message--mine"
                                        : "support-chat__message--incoming"
                                }`}
                            >

                                <div className="support-chat__bubble">

                                    {message.message && (
                                        <p>
                                            {message.message}
                                        </p>
                                    )}

                                    {message.file && (
                                        <a
                                            href={message.file}
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            View attachment
                                        </a>
                                    )}

                                    <time>
                                        {formatTime(
                                            message.createdAt
                                        )}
                                    </time>

                                </div>

                            </div>
                        );
                    })

                )}

            </div>

            {error && messages.length > 0 && (
                <div className="support-chat__error">
                    {error}
                </div>
            )}

            <form
                className="support-chat__input"
                onSubmit={handleSubmit}
            >

                <input
                    type="text"
                    value={text}
                    onChange={(event) =>
                        setText(event.target.value)
                    }
                    placeholder="Write a support reply..."
                    disabled={sending}
                    autoComplete="off"
                />

                <button
                    type="submit"
                    disabled={
                        sending ||
                        !text.trim()
                    }
                    aria-label="Send support message"
                >
                    <FiSend />
                </button>

            </form>

        </section>
    );
}
