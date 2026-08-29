import { useEffect, useRef } from "react";

import MessageBubble from "../MessageBubble";

import "./ChatWindow.css";

export default function ChatWindow({

    currentUser,
    selectedUser,
    messages,
    typing,
    onlineUsers,

    setReplyMessage,
    handleDeleteForMe,
    handleDeleteForEveryone,

    search,
    handleSearch,

    loadSharedFiles,
    setShowMedia,

    loadOlderMessages,
    loadingMore

}) {

    const bottomRef = useRef(null);

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

    return (

        <>

            {/* Header */}



            <div className="chatHeader">

                <div className="chatHeaderLeft">

                    <img

                        src={

                            selectedUser.avatar ||

                            "/profile/default-profile.svg"

                        }

                        alt="profile"

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

            </div>

            <div className="messageSearch">

                <input
                    type="text"
                    placeholder="Search messages..."
                    value={search}
                    onChange={(e) =>
                        handleSearch(e.target.value)
                    }
                />

                <button
                    className="mediaBtn"
                    onClick={async () => {

                        await loadSharedFiles();

                        setShowMedia(true);

                    }}
                >
                    📷 Media
                </button>

            </div>

            {/* Messages */}

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
                            onReply={setReplyMessage}
                            onDeleteForMe={handleDeleteForMe}
                            onDeleteForEveryone={handleDeleteForEveryone}

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

        </>

    );

}