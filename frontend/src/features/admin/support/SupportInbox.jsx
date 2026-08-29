import "./SupportInbox.css";

import { useCallback, useEffect, useState } from "react";
import { FiMessageCircle, FiRefreshCw, FiUser } from "react-icons/fi";

import {
    getSupportInbox
} from "../../../services/api/support.service";

import SupportChat from "./components/SupportChat";
import { socket } from "../../../services/socket/socket";

const getStudentName = (student) => {
    if (!student) {
        return "Unknown Student";
    }

    const fullName = [
        student.firstName,
        student.lastName
    ]
        .filter(Boolean)
        .join(" ")
        .trim();

    return fullName || student.email || "Unknown Student";
};

const formatDate = (date) => {
    if (!date) {
        return "";
    }

    const value = new Date(date);

    if (Number.isNaN(value.getTime())) {
        return "";
    }

    return value.toLocaleString([], {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit"
    });
};

export default function SupportInbox() {

    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] =
        useState(null);

    const [currentUser, setCurrentUser] =
        useState(null);

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {

        try {

            const storedUser =
                localStorage.getItem("admin") ||
                localStorage.getItem("user");

            if (storedUser) {
                setCurrentUser(
                    JSON.parse(storedUser)
                );
            }

        } catch (err) {

            console.error(
                "Failed to load current admin:",
                err
            );

        }

    }, []);

    const loadInbox = useCallback(
        async (isRefresh = false) => {

            try {

                if (isRefresh) {
                    setRefreshing(true);
                } else {
                    setLoading(true);
                }

                setError("");

                const data =
                    await getSupportInbox();

                const inbox =
                    Array.isArray(data?.conversations)
                        ? data.conversations
                        : [];

                setConversations(inbox);

                setSelectedConversation(
                    (previous) => {

                        if (!previous?._id) {
                            return previous;
                        }

                        return (
                            inbox.find(
                                (item) =>
                                    item._id ===
                                    previous._id
                            ) || null
                        );
                    }
                );

            } catch (err) {

                console.error(
                    "Failed to load support inbox:",
                    err
                );

                setError(
                    err?.response?.data?.message ||
                    "Failed to load support inbox."
                );

            } finally {

                setLoading(false);
                setRefreshing(false);

            }
        },
        []
    );

    useEffect(() => {
        loadInbox();
    }, [loadInbox]);

    useEffect(() => {
        const handleConversationUpdated = (updatedConversation) => {
            if (!updatedConversation?._id) {
                return;
            }

            setConversations((previous) => {
                const exists = previous.some(
                    (item) =>
                        String(item._id) ===
                        String(updatedConversation._id)
                );

                if (!exists) {
                    return [
                        updatedConversation,
                        ...previous
                    ];
                }

                return previous
                    .map((item) =>
                        String(item._id) ===
                        String(updatedConversation._id)
                            ? {
                                ...item,
                                ...updatedConversation
                            }
                            : item
                    )
                    .sort(
                        (a, b) =>
                            new Date(
                                b.lastMessageAt ||
                                b.updatedAt ||
                                0
                            ) -
                            new Date(
                                a.lastMessageAt ||
                                a.updatedAt ||
                                0
                            )
                    );
            });
        };

        socket.on(
            "supportConversationUpdated",
            handleConversationUpdated
        );

        return () => {
            socket.off(
                "supportConversationUpdated",
                handleConversationUpdated
            );
        };
    }, []);

    const handleSelectConversation = (
        conversation
    ) => {
        setSelectedConversation(conversation);
    };

    const handleBack = () => {
        setSelectedConversation(null);
        loadInbox(true);
    };

    if (selectedConversation) {

        return (
            <section className="support-inbox">

                <SupportChat
                    conversation={
                        selectedConversation
                    }
                    currentUser={currentUser}
                    onBack={handleBack}
                />

            </section>
        );
    }

    return (
        <section className="support-inbox">

            <div className="support-inbox__header">

                <div>

                    <span className="support-inbox__eyebrow">
                        ADMIN SUPPORT
                    </span>

                    <h1>
                        Support Inbox
                    </h1>

                    <p>
                        Manage student support conversations
                        from one place.
                    </p>

                </div>

                <button
                    type="button"
                    className="support-inbox__refresh"
                    onClick={() => loadInbox(true)}
                    disabled={
                        loading ||
                        refreshing
                    }
                >

                    <FiRefreshCw
                        className={
                            refreshing
                                ? "support-inbox__spin"
                                : ""
                        }
                    />

                    <span>
                        Refresh
                    </span>

                </button>

            </div>

            <div className="support-inbox__summary">

                <div className="support-inbox__summary-card">

                    <span>
                        Total Conversations
                    </span>

                    <strong>
                        {conversations.length}
                    </strong>

                </div>

                <div className="support-inbox__summary-card">

                    <span>
                        Unread
                    </span>

                    <strong>
                        {
                            conversations.reduce(
                                (
                                    total,
                                    conversation
                                ) =>
                                    total +
                                    Number(
                                        conversation.unreadForAdmin ||
                                        0
                                    ),
                                0
                            )
                        }
                    </strong>

                </div>

            </div>

            {loading ? (

                <div className="support-inbox__state">

                    <div className="support-inbox__loader" />

                    <p>
                        Loading support inbox...
                    </p>

                </div>

            ) : error ? (

                <div className="support-inbox__state support-inbox__state--error">

                    <FiMessageCircle />

                    <h3>
                        Unable to load inbox
                    </h3>

                    <p>
                        {error}
                    </p>

                    <button
                        type="button"
                        onClick={() =>
                            loadInbox()
                        }
                    >
                        Try Again
                    </button>

                </div>

            ) : conversations.length === 0 ? (

                <div className="support-inbox__state">

                    <FiMessageCircle />

                    <h3>
                        No support conversations
                    </h3>

                    <p>
                        Student support conversations
                        will appear here.
                    </p>

                </div>

            ) : (

                <div className="support-inbox__list">

                    {conversations.map(
                        (conversation) => {

                            const student =
                                conversation.student;

                            const unread =
                                Number(
                                    conversation.unreadForAdmin ||
                                    0
                                );

                            const lastMessage =
                                conversation.lastMessage;

                            return (
                                <button
                                    type="button"
                                    className={`support-conversation ${
                                        unread > 0
                                            ? "support-conversation--unread"
                                            : ""
                                    }`}
                                    key={
                                        conversation._id
                                    }
                                    onClick={() =>
                                        handleSelectConversation(
                                            conversation
                                        )
                                    }
                                >

                                    <div className="support-conversation__avatar">

                                        {student?.avatar ? (

                                            <img
                                                src={
                                                    student.avatar
                                                }
                                                alt={
                                                    getStudentName(
                                                        student
                                                    )
                                                }
                                            />

                                        ) : (

                                            <FiUser />

                                        )}

                                    </div>

                                    <div className="support-conversation__content">

                                        <div className="support-conversation__top">

                                            <strong>
                                                {getStudentName(
                                                    student
                                                )}
                                            </strong>

                                            <time>
                                                {
                                                    formatDate(
                                                        conversation.lastMessageAt ||
                                                        conversation.updatedAt
                                                    )
                                                }
                                            </time>

                                        </div>

                                        <div className="support-conversation__bottom">

                                            <p>
                                                {
                                                    lastMessage?.message ||
                                                    (
                                                        lastMessage?.file
                                                            ? "Attachment"
                                                            : "No messages yet"
                                                    )
                                                }
                                            </p>

                                            <div className="support-conversation__meta">

                                                <span
                                                    className={`support-status support-status--${conversation.status}`}
                                                >
                                                    {
                                                        conversation.status
                                                    }
                                                </span>

                                                {unread > 0 && (

                                                    <span className="support-unread">
                                                        {unread}
                                                    </span>

                                                )}

                                            </div>

                                        </div>

                                    </div>

                                </button>
                            );
                        }
                    )}

                </div>

            )}

        </section>
    );
}
