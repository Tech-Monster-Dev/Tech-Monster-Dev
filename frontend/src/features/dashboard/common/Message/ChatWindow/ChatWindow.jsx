import { FiArrowLeft, FiInfo, FiSearch, FiCheckSquare, FiStar, FiDownload, FiTrash2 } from "react-icons/fi";

import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";



import MessageBubble from "../MessageBubble";



import "./ChatWindow.css";

import defaultProfileImage from "../../../../../assets/profile/default-profile.svg";



export default function ChatWindow({



    currentUser,

    selectedUser,

    messages,

    typing,

    onlineUsers,



    setReplyMessage,

    handleDeleteForMe,

    handleDeleteForEveryone,

    handleDeleteConversation,
    handleToggleMute,
    handleExportChat,
    handleToggleBlock,
    mutedUsers,
    blockedUsers,
    blockedByUsers,

    showChatMenu,

    setShowChatMenu,

    showUserInfo,
    setShowUserInfo,



    search,

    showMessageSearch,

    setShowMessageSearch,

    selectionMode,
    setSelectionMode,
    selectedMessageIds,
    setSelectedMessageIds,

    handleSearch,




    loadStarredMessages,
    starredMessages,
    showStarredMessages,
    setShowStarredMessages,




    loadOlderMessages,

    onMobileBack,

    loadingMore



}) {



    const bottomRef = useRef(null);
    const navigate = useNavigate();



    useEffect(() => {



        bottomRef.current?.scrollIntoView({



            behavior: "smooth"



        });



    }, [messages, typing]);



    if (!selectedUser) {



        return (



            <div className="emptyChat">



                <h2>



                    💬 Welcome



                </h2>



                <p>



                    Select a user to start chatting.



                </p>



            </div>



        );



    }



    const isOnline = onlineUsers.includes(
        selectedUser._id
    );

    const isBlocked = blockedUsers?.some(
        (id) => String(id) === String(selectedUser?._id)
    );

    const isBlockedBySelectedUser = blockedByUsers?.some(
        (id) => String(id) === String(selectedUser?._id)
    );



    return (



        <>



            {/* Header */}







            <div className="chatHeader">



                <div className="chatHeaderLeft">

                    <button type="button" className="mobileChatBack" onClick={onMobileBack} aria-label="Back to conversations"><FiArrowLeft /></button>



                    <img



                        src={



                            selectedUser.avatar && selectedUser.avatar !== "/profile/default-profile.svg"

                                ? selectedUser.avatar

                                : defaultProfileImage



                        }



                        alt="profile"



                        onError={(event) => {

                            event.currentTarget.src = defaultProfileImage;

                        }}



                    />



                    <div>



                        <h3>



                            {selectedUser.firstName}{" "}



                            {selectedUser.lastName}



                        </h3>



                        <small>



                            {



                                isOnline



                                    ?



                                    "🟢 Online"



                                    :



                                    "⚪ Offline"



                            }



                        </small>



                    </div>



                </div>



                <div className="chatHeaderMenu">

                    {selectionMode && (
                        <button
                            type="button"
                            className="selectAllBtn"
                            onClick={() => {
                                if (selectedMessageIds.length > 0) {
                                    setSelectedMessageIds([]);
                                    setSelectionMode(false);
                                    return;
                                }
                                const today = new Date().toDateString();
                                const todayIds = messages.filter(msg => new Date(msg.createdAt || msg.timestamp).toDateString() === today).map(msg => msg._id);
                                setSelectedMessageIds(todayIds);
                            }}
                            aria-label="Select all messages from today"
                            title="Select all messages from today"
                        >
                            ✓
                        </button>
                    )}

                    <button
                        type="button"
                        className="chatMenuBtn"

                        onClick={() => setShowChatMenu(prev => !prev)}

                        aria-label="More options"

                        title="More options"

                    >

                        ⋮

                    </button>

                    {showChatMenu && (

                        <div className="chatMenuDropdown">

                            <button type="button" onClick={() => { setShowChatMenu(false); setShowUserInfo(true); }}><FiInfo /> Info</button>
                            <button type="button" onClick={() => { setShowChatMenu(false); setShowMessageSearch(true); }}><FiSearch /> Search</button>
                            <button type="button" onClick={() => { setShowChatMenu(false); setSelectionMode(true); setSelectedMessageIds([]); }}><FiCheckSquare /> Select messages</button>
                            <button type="button" onClick={async () => { setShowChatMenu(false); await loadStarredMessages(); }}><FiStar /> Starred messages</button>
                            <button type="button" onClick={async () => { setShowChatMenu(false); await handleExportChat(); }}><FiDownload /> Export chat</button>
                            <button type="button" onClick={handleToggleMute}>{mutedUsers.some((id) => String(id) === String(selectedUser?._id)) ? "Unmute" : "Mute"}</button>
                            <button type="button" onClick={handleDeleteConversation}><FiTrash2 /> Clear chat</button>
                            <button type="button" onClick={() => { setShowChatMenu(false); navigate("/student/settings#messages"); }}>⚙ Settings</button>
                            <button
                                type="button"
                                className="danger"
                                onClick={async () => {
                                    setShowChatMenu(false);
                                    await handleToggleBlock();
                                }}
                            >
                                Block
                            </button>
                        </div>

                    )}

                </div>



            </div>



            {showMessageSearch && (
                <div className="messageSearch">
                    <input
                        type="text"
                        placeholder="Search messages..."
                        value={search}
                        onChange={(e) => handleSearch(e.target.value)}
                        autoFocus
                    />
                    <button
                        type="button"
                        className="messageSearchClose"
                        onClick={() => {
                            setShowMessageSearch(false);
                            handleSearch("");
                        }}
                        aria-label="Close search"
                        title="Close search"
                    >
                        ×
                    </button>
                </div>
            )}

            {/* Messages */}

            {isBlockedBySelectedUser && (
                <div className="chatBlockedWarning">
                    <strong>🚫 You have been blocked</strong>
                    <span>
                        {selectedUser.firstName || "This user"} has blocked you.
                    </span>
                </div>
            )}

            {isBlocked && (
                <div className="chatBlockedWarning">
                    <strong>🚫 You blocked this user</strong>
                    <span>
                        You cannot send messages to {selectedUser.firstName || "this user"}.
                    </span>
                </div>
            )}



            <div

                className="messagesContainer"

                onScroll={(e) => {



                    if (

                        e.target.scrollTop === 0

                    ) {



                        loadOlderMessages();



                    }



                }}

            >



                {

                    loadingMore && (



                        <div className="loadingOlder">



                            Loading older messages...



                        </div>



                    )

                }



                {



                    messages.map(msg => (



                        <MessageBubble

                            key={msg._id}

                            message={msg}

                            currentUser={currentUser}

                            isSelfChat={String(selectedUser?._id) === String(currentUser?._id)}

                            onReply={setReplyMessage}

                            onDeleteForMe={handleDeleteForMe}

                            onDeleteForEveryone={handleDeleteForEveryone}
                            selectionMode={selectionMode}
                            isSelected={selectedMessageIds.includes(msg._id)}
                            onSelect={() => setSelectedMessageIds(prev => prev.includes(msg._id) ? prev.filter(id => id !== msg._id) : [...prev, msg._id])}

                        />



                    ))



                }



                {



                    typing &&



                    <div className="typingIndicator">



                        Typing...



                    </div>



                }



                <div



                    ref={bottomRef}



                />



            </div>



            {showUserInfo && (

                <div className="chatInfoOverlay" onClick={() => setShowUserInfo(false)}>

                    <div className="chatInfoPanel" onClick={(event) => event.stopPropagation()}>

                        <div className="chatInfoHeader">

                            <h3>Info</h3>

                            <button type="button" onClick={() => setShowUserInfo(false)} aria-label="Close info">�</button>

                        </div>



                        <div className="chatInfoProfile">

                            <img

                                src={selectedUser.avatar && selectedUser.avatar !== "/profile/default-profile.svg" ? selectedUser.avatar : defaultProfileImage}

                                alt="profile"

                                onError={(event) => { event.currentTarget.src = defaultProfileImage; }}

                            />

                            <h2>{[selectedUser.firstName, selectedUser.middleName, selectedUser.lastName].filter(Boolean).join(" ") || "Unknown User"}</h2>

                            {selectedUser.username && <p>@{selectedUser.username}</p>}

                        </div>



                        <div className="chatInfoDetails">

                            {[

                                ["User ID", selectedUser._id],

                                ["Email", selectedUser.email],

                                ["Role", selectedUser.role],

                                ["Bio", selectedUser.bio],

                                ["Gender", selectedUser.gender],

                                ["Date of Birth", selectedUser.dateOfBirth && new Date(selectedUser.dateOfBirth).toLocaleDateString()],

                                ["Education", selectedUser.education],

                                ["College", selectedUser.college],

                                ["Branch", selectedUser.branch],

                                ["Year", selectedUser.year],

                                ["Semester", selectedUser.semester],

                                ["GitHub", selectedUser.github],

                                ["LinkedIn", selectedUser.linkedin],

                                ["Skills", Array.isArray(selectedUser.skills) ? selectedUser.skills.join(", ") : selectedUser.skills],

                                ["Current Address", selectedUser.currentAddress],

                                ["Local Address", selectedUser.localAddress],

                                ["District", selectedUser.district],

                                ["State", selectedUser.state],

                                ["Pincode", selectedUser.pincode],

                                ["Joined", selectedUser.createdAt && new Date(selectedUser.createdAt).toLocaleDateString()],

                                ["Last Login", selectedUser.lastLogin && new Date(selectedUser.lastLogin).toLocaleString()]

                            ].filter(([, value]) => value !== undefined && value !== null && value !== "").map(([label, value]) => (

                                <div className="chatInfoRow" key={label}>

                                    <span>{label}</span>

                                    <strong>{String(value)}</strong>

                                </div>

                            ))}

                        </div>

                    </div>

                </div>

            )}



            {showStarredMessages && (
                <div className="starredMessagesOverlay">
                    <div className="starredMessagesPanel">
                        <div className="starredMessagesHeader">
                            <h3><FiStar /> Starred messages</h3>
                            <button type="button" onClick={() => setShowStarredMessages(false)} aria-label="Close starred messages">×</button>
                        </div>
                        <div className="starredMessagesList">
                            {starredMessages.length === 0 ? (
                                <p className="starredMessagesEmpty">No starred messages in this chat.</p>
                            ) : (
                                starredMessages.map((msg) => (
                                    <div className="starredMessageItem" key={msg._id}>
                                        <div className="starredMessageText">{msg.message || msg.text || "Attachment"}</div>
                                        <div className="starredMessageTime">
                                            {new Date(msg.createdAt || msg.timestamp).toLocaleString()}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}


        </>



    );



}