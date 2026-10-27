import "./Message.css";
import { useEffect, useState, useRef } from "react";

import {
    getChatUsers,
    sendMessage,
    markAsSeen,
    deleteForMe,
    deleteForEveryone,
    deleteConversationForMe,
    searchMessages,
    getMessagesPage,
    getStarredMessages,
    toggleChatMute,
    getMutedChats,
    toggleChatBlock,
    exportChat
} from "../../services/api/message.service";

import { socket } from "../../services/socket/socket";

import ChatSidebar from "./components/ChatSidebar";
import ChatWindow from "./components/ChatWindow";
import ChatInput from "./components/ChatInput";


export default function Message() {
    const [notificationState, setNotificationState] = useState(null);

    useEffect(() => {
        try {
            const saved = sessionStorage.getItem("tech-monster-navigation-state");
            if (saved) {
                const parsed = JSON.parse(saved);
                if (parsed?.notificationUserId) {
                    queueMicrotask(() => {
                        setNotificationState(parsed);
                    });
                }
                sessionStorage.removeItem("tech-monster-navigation-state");
            }
        } catch {
            sessionStorage.removeItem("tech-monster-navigation-state");
        }
    }, []);
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [mobileChatOpen, setMobileChatOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [selectionMode, setSelectionMode] = useState(false);
    const [selectedMessageIds, setSelectedMessageIds] = useState([]);
    const [text, setText] = useState("");
    const [typing, setTyping] = useState(false);
    const typingTimeoutRef = useRef(null);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [replyMessage, setReplyMessage] = useState(null);
    const [search, setSearch] = useState("");
    const [showMessageSearch, setShowMessageSearch] = useState(false);
    const [starredMessages, setStarredMessages] = useState([]);
    const [showStarredMessages, setShowStarredMessages] = useState(false);
    const [mutedUsers, setMutedUsers] = useState([]);
    const [blockedUsers, setBlockedUsers] = useState([]);
    const [blockedByUsers, setBlockedByUsers] = useState([]);
    const [showChatMenu, setShowChatMenu] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);

    // Prevent duplicate requests without blocking unrelated chat actions.
    const sendInFlightRef = useRef(false);
    const muteInFlightRef = useRef(false);
    const blockInFlightRef = useRef(false);
    const deleteConversationInFlightRef = useRef(false);
    const messageDeletionInFlightRef = useRef(new Set());

    // ===============================
    // Load Current User
    // ===============================
    useEffect(() => {
        const user = JSON.parse(
            localStorage.getItem("user")
        );

        if (user) {
            queueMicrotask(() => {
                setCurrentUser({ ...user, _id: user._id || user.id, firstName: user.firstName || user.firstname, lastName: user.lastName || user.lastname });
            });
        }
    }, []);

    useEffect(() => {
        if (!currentUser) return;

        const loadMutedChats = async () => {
            try {
                const res = await getMutedChats();
                setMutedUsers(res.mutedUsers || []);
            } catch (err) {
                console.error("Failed to load muted chats:", err);
            }
        };
        loadMutedChats();
    }, [currentUser]);

    // ===============================
    // Load Chat Users
    // ===============================

    const loadUsers = async () => {
        try {
            const res = await getChatUsers();
            const chatUsers = res.users || [];
            setUsers(chatUsers);

        } catch (err) {
            console.log(err);
        }
    };

    // ===============================
    // Socket Connect
    // ===============================

    useEffect(() => {
        if (!currentUser) return;
        socket.connect();
        socket.emit(
            "join",
            currentUser._id
        );
        socket.emit("activeChat", { withUser: selectedUser?._id || null });
        socket.on(
            "onlineUsers",
            (users) => {
                setOnlineUsers(users);
                loadUsers();
            }
        );

        socket.on(
            "chatUsersUpdated",
            (payload) => {
                loadUsers();
                if (!payload?.userId) return;
                const userId = payload.userId.toString();

                if (payload.type === "block") {
                    setBlockedUsers(prev =>
                        [...new Set([...prev, userId])]
                    );
                }

                if (payload.type === "blockedBy") {
                    setBlockedByUsers(prev =>
                        [...new Set([...prev, userId])]
                    );
                }

                if (payload.type === "unblock") {
                    setBlockedUsers(prev =>
                        prev.filter(id => id.toString() !== userId)
                    );

                    setBlockedByUsers(prev =>
                        prev.filter(id => id.toString() !== userId)
                    );
                }
            }
        );

        socket.on(
            "typing",
            ({ sender }) => {
                if (selectedUser && String(sender) === String(selectedUser._id)) {
                    setTyping(true);
                }
            }
        );

        socket.on(
            "stopTyping",
            ({ sender }) => {
                if (selectedUser && String(sender) === String(selectedUser._id)) {
                    setTyping(false);
                }
            }
        );

        socket.on(
            "receiveMessage",
            async (message) => {
                if (
                    selectedUser &&
                    message.sender._id === selectedUser._id &&
                    String(message.sender._id) !== String(currentUser?._id)
                ) {
                    setMessages(prev =>
                        prev.some(item => String(item._id) === String(message._id))
                            ? prev
                            : [...prev, message]
                    );

                    try {
                        await markAsSeen(message.sender._id);
                    } catch (error) {
                        console.error("Failed to mark message as seen:", error);
                    }
                }
            }
        );

        socket.on(
            "messagesSeen",
            ({ messageIds = [] }) => {
                const seenIds = new Set(
                    messageIds.map(id => String(id))
                );

                setMessages(prev =>
                    prev.map(msg =>
                        seenIds.has(String(msg._id))
                            ? { ...msg, seen: true, delivered: true }
                            : msg
                    )
                );
            }
        );

        socket.on(
            "messageDeleted",
            ({ messageId }) => {
                setMessages(prev =>
                    prev.map(msg =>
                        msg._id === messageId
                            ? {
                                ...msg,
                                isDeleted: true,
                                message: "",
                                file: ""
                            }
                            : msg
                    )
                );
            }
        );

        return () => {
            socket.emit("activeChat", { withUser: null });
            socket.off("onlineUsers");
            socket.off("chatUsersUpdated");
            socket.off("typing");
            socket.off("stopTyping");
            socket.off("receiveMessage");
            socket.off("messagesSeen");
            socket.off("messageDeleted");
            socket.disconnect();
        };
    }, [currentUser, selectedUser]);

    useEffect(() => {
        queueMicrotask(() => {
            loadUsers();
        });
    }, []);

    // ===============================
    // Open Chat
    // ===============================

    const openChat = async (user) => {
        setMobileChatOpen(true);

        setSelectedUser(user);
        localStorage.setItem("messageSelectedUserId", String(user._id));

        socket.emit("activeChat", {
            withUser: user._id
        });

        try {
            setPage(1);
            const res = await getMessagesPage(
                user._id,
                1
            );

            setMessages(res.messages);
            setHasMore(res.hasMore);

            setBlockedUsers(prev =>
                res.blocked
                    ? [...new Set([...prev, user._id.toString()])]
                    : prev.filter(id => id !== user._id.toString())
            );

            setBlockedByUsers(prev =>
                res.blockedBy
                    ? [...new Set([...prev, user._id.toString()])]
                    : prev.filter(id => id !== user._id.toString())
            );

            await markAsSeen(
                user._id
            );
        }
        catch (err) {
            console.log(err);
        }
    };

    useEffect(() => {
        if (users.length === 0 || selectedUser != null || notificationState?.notificationUserId) {
            return;
        }

        const savedUserId = localStorage.getItem("messageSelectedUserId");
        if (savedUserId == null || savedUserId === "") return;

        const savedUser = users.find(
            (user) => String(user._id) === String(savedUserId)
        );

        if (savedUser) {
            queueMicrotask(() => openChat(savedUser));
        } else {
            localStorage.removeItem("messageSelectedUserId");
        }
    }, [users, selectedUser, notificationState?.notificationUserId]);

    useEffect(() => {
        const notificationUserId = notificationState?.notificationUserId;

        if (!notificationUserId || users.length === 0) {
            return;
        }

        const targetUser = users.find(
            (user) =>
                String(user._id) ===
                String(notificationUserId)
        );

        if (!targetUser) {
            return;
        }

        queueMicrotask(() => {
            openChat(targetUser);
            setNotificationState(null);
        });
    }, [
        users,
        notificationState?.notificationUserId
    ]);

    const closeMobileChat = () => {
        socket.emit("activeChat", {
            withUser: null
        });
        setMobileChatOpen(false);
        setSelectedUser(null);
        localStorage.removeItem("messageSelectedUserId");
    };

    const loadStarredMessages = async () => {
        if (!selectedUser?._id) return;
        try {
            const res = await getStarredMessages(selectedUser._id);
            setStarredMessages(res.messages || []);
            setShowStarredMessages(true);
        } catch (err) {
            console.error("Failed to load starred messages:", err);
        }
    };
    const handleSearch = async (value) => {
        setSearch(value);
        if (!selectedUser) return;

        if (!value.trim()) {
            openChat(selectedUser);
            return;
        }

        try {
            const res = await searchMessages(
                selectedUser._id,
                value
            );

            setMessages(
                res.messages
            );
        }
        catch (err) {
            console.log(err);
        }
    };

    // ===============================
    // Send Text Message
    // ===============================

    const handleSend = async () => {
        if (sendInFlightRef.current) return;
        if (!selectedUser?._id || !text.trim()) return;

        if (
            blockedUsers?.some((id) => String(id) === String(selectedUser._id)) ||
            blockedByUsers?.some((id) => String(id) === String(selectedUser._id))
        ) {
            return;
        }

        sendInFlightRef.current = true;
        const receiverId = selectedUser._id;
        const messageText = text;
        const replyTo = replyMessage?._id;

        try {
            const res = await sendMessage({
                receiver: receiverId,
                message: messageText,
                replyTo
            });
            setMessages(prev => [
                ...prev,
                res.data
            ]);
            await loadUsers();
            setText("");
            setReplyMessage(null);
            socket.emit(
                "stopTyping",
                {
                    receiver: receiverId
                }
            );
        } catch (err) {
            console.log(err);
        } finally {
            sendInFlightRef.current = false;
        }
    };

    // ===============================
    // Typing
    // ===============================

    const handleTyping = (value) => {

        setText(value);
        if (!selectedUser?._id) return;

        socket.emit("typing", {
            receiver: selectedUser._id
        });

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        typingTimeoutRef.current = setTimeout(() => {
            socket.emit("stopTyping", {
                receiver: selectedUser._id
            });
            typingTimeoutRef.current = null;
        }, 800);
    };

    const handleExportChat = async () => {
        if (!selectedUser?._id) return;

        try {
            const response = await exportChat(selectedUser._id);
            const blobUrl = window.URL.createObjectURL(response.data);
            const link = document.createElement("a");

            link.href = blobUrl;
            link.download = `Chat-${selectedUser._id}.pdf`;
            document.body.appendChild(link);
            link.click();
            link.remove();

            window.URL.revokeObjectURL(blobUrl);
        } catch (err) {
            console.error("Failed to export chat:", err);
        }
    };

    const handleToggleMute = async () => {
        if (muteInFlightRef.current || !selectedUser?._id) return;

        muteInFlightRef.current = true;
        const userId = selectedUser._id.toString();
        setShowChatMenu(false);

        try {
            const res = await toggleChatMute(userId);

            setMutedUsers((prev) =>
                res.muted
                    ? [...new Set([...prev, userId])]
                    : prev.filter((id) => id.toString() !== userId)
            );
        } catch (err) {
            console.error("Failed to toggle chat mute:", err);
        } finally {
            muteInFlightRef.current = false;
        }
    };

    const handleToggleBlock = async () => {
        if (blockInFlightRef.current || !selectedUser?._id) return;

        blockInFlightRef.current = true;
        const userId = selectedUser._id.toString();

        try {
            const result = await toggleChatBlock(userId);

            setBlockedUsers((prev) =>
                result.blocked
                    ? [...new Set([...prev, userId])]
                    : prev.filter((id) => id.toString() !== userId)
            );
            setShowChatMenu(false);
            await loadUsers();
        } catch (err) {
            console.error("Block toggle failed:", err);
        } finally {
            blockInFlightRef.current = false;
        }
    };

    const handleDeleteConversation = async () => {
        if (deleteConversationInFlightRef.current || !selectedUser?._id) return;

        deleteConversationInFlightRef.current = true;
        const userId = selectedUser._id;

        try {
            await deleteConversationForMe(userId);
            setMessages([]);
            setShowChatMenu(false);
            await loadUsers();
        } catch (err) {
            console.log(err);
        } finally {
            deleteConversationInFlightRef.current = false;
        }
    };

    const handleDeleteForMe = async (id) => {
        if (messageDeletionInFlightRef.current.has(id)) return;
        messageDeletionInFlightRef.current.add(id);

        try {
            await deleteForMe(id);
            await loadUsers();
            setMessages(prev =>
                prev.filter(
                    msg => msg._id !== id
                )
            );
        } catch (err) {
            console.log(err);
        } finally {
            messageDeletionInFlightRef.current.delete(id);
        }
    };

    const handleDeleteForEveryone = async (id) => {
        if (messageDeletionInFlightRef.current.has(id)) return;
        messageDeletionInFlightRef.current.add(id);

        try {
            await deleteForEveryone(id);
            await loadUsers();
            setMessages(prev =>
                prev.map(msg =>
                    msg._id === id
                        ? {
                            ...msg,
                            isDeleted: true,
                            message: "",
                            file: ""
                        }
                        : msg
                )
            );
        } catch (err) {
            console.log(err);
        } finally {
            messageDeletionInFlightRef.current.delete(id);
        }
    };

    const loadOlderMessages = async () => {

        if (
            !selectedUser ||
            !hasMore ||
            loadingMore
        ) return;

        try {
            setLoadingMore(true);
            const next = page + 1;
            const res = await getMessagesPage(
                selectedUser._id,
                next
            );

            setMessages(prev => [
                ...res.messages,
                ...prev
            ]);
            setPage(next);
            setHasMore(
                res.hasMore
            );
        }
        finally {
            setLoadingMore(false);
        }
    };

    return (
        <div className={`chatContainer ${mobileChatOpen ? "mobile-chat-open" : ""}`}>
            <ChatSidebar
                users={users}
                selectedUser={selectedUser}
                openChat={openChat}
                onlineUsers={onlineUsers}
                mutedUsers={mutedUsers}
            />

            <div className="chatRight">
                <ChatWindow
                    currentUser={currentUser}
                    selectedUser={selectedUser}
                    messages={messages}
                    typing={typing}
                    onlineUsers={onlineUsers}
                    setReplyMessage={setReplyMessage}
                    handleDeleteForMe={handleDeleteForMe}
                    handleDeleteForEveryone={handleDeleteForEveryone}
                    handleDeleteConversation={handleDeleteConversation}
                    handleToggleMute={handleToggleMute}
                    handleToggleBlock={handleToggleBlock}
                    blockedUsers={blockedUsers}
                    blockedByUsers={blockedByUsers}
                    handleExportChat={handleExportChat}
                    mutedUsers={mutedUsers}
                    showChatMenu={showChatMenu}
                    setShowChatMenu={setShowChatMenu}
                    search={search}
                    showMessageSearch={showMessageSearch}
                    setShowMessageSearch={setShowMessageSearch}
                    selectionMode={selectionMode}
                    setSelectionMode={setSelectionMode}
                    selectedMessageIds={selectedMessageIds}
                    setSelectedMessageIds={setSelectedMessageIds}
                    handleSearch={handleSearch}
                    loadStarredMessages={loadStarredMessages}
                    starredMessages={starredMessages}
                    showStarredMessages={showStarredMessages}
                    setShowStarredMessages={setShowStarredMessages}
                    loadOlderMessages={loadOlderMessages}
                    onMobileBack={closeMobileChat}
                    loadingMore={loadingMore}
                />

                {
                    replyMessage && (
                        <div className="replyPreview">
                            <div>
                                <strong>
                                    {
                                        replyMessage.sender.firstName
                                    }
                                </strong>
                            </div>

                            <p>
                                {
                                    replyMessage.message
                                }
                            </p>

                            <button
                                onClick={() =>
                                    setReplyMessage(null)
                                }
                            >
                                ✕
                            </button>
                        </div>
                    )
                }

                {
                    selectedUser &&
                    !blockedUsers.includes(selectedUser._id.toString()) &&
                    !blockedByUsers.includes(selectedUser._id.toString()) &&
                    <ChatInput
                        text={text}
                        setText={handleTyping}
                        handleSend={handleSend}
                    />
                }
            </div>
        </div>
    );
}
