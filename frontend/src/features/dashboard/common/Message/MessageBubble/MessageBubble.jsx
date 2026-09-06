import "./MessageBubble.css";
import { useEffect, useRef, useState } from "react";
import { HiDotsVertical } from "react-icons/hi";
import { toggleStarMessage } from "../../../../../services/api/message.service.js";

export default function MessageBubble({

    message,

    currentUser,
    isSelfChat,
    onDeleteForMe,

    onDeleteForEveryone,
    onReply,
    selectionMode,
    isSelected,
    onSelect

}) {

    const isMine =

        String(message.sender?._id || message.sender) === String(currentUser?._id);

    const isImage =

        message.file &&
        (
            message.file.endsWith(".jpg") ||
            message.file.endsWith(".jpeg") ||
            message.file.endsWith(".png") ||
            message.file.endsWith(".webp")
        );

    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (menuRef.current == null || menuRef.current.contains(event.target) == false) {
                setShowMenu(false);
            }
        };
        document.addEventListener("mousedown", handleOutsideClick);
        return () => document.removeEventListener("mousedown", handleOutsideClick);
    }, []);

    return (

        <div

            className={

                `messageRow ${isMine ? "mine" : "other"}${isSelected ? " selected" : ""}`

            }

            onClick={selectionMode ? onSelect : undefined}

        >

            <div className="messageBubble" ref={menuRef}>



                <button

                    className={"msgMenuBtn" + (message.replyTo != null ? " replyMsgMenuBtn" : "")}

                    onClick={() =>

                        setShowMenu(!showMenu)

                    }

                >

                    <HiDotsVertical />

                </button>

                {

                    showMenu && (

                        <div className="msgMenu">

                            {!isSelfChat && (
                                <button
                                    onClick={() => {
                                        onReply(message);
                                        setShowMenu(false);
                                    }}
                                >
                                    Reply
                                </button>
                            )}

                            <button
                                onClick={async () => {
                                    try {
                                        await toggleStarMessage(message._id);
                                    } catch (err) {
                                        console.error("Failed to toggle star:", err);
                                    }
                                    setShowMenu(false);
                                }}
                            >
                                {message.starredBy?.some(id => String(id) === String(currentUser?._id)) ? "Unstar message" : "Star message"}
                            </button>

                            <button
                                onClick={() => {
                                    onDeleteForMe(message._id);
                                    setShowMenu(false);
                                }}
                            >
                                Delete for Me
                            </button>

                            {
                                isMine && message.isDeleted == false && message.replyTo == null &&
                                <button
                                    onClick={() => {
                                        onDeleteForEveryone(message._id);
                                        setShowMenu(false);
                                    }}
                                >
                                    Delete for Everyone
                                </button>
                            }

                        </div>

                    )

                }

                {message.starredBy?.some(id => String(id) === String(currentUser?._id)) && (
                    <span className="messageStar" aria-label="Starred message" title="Starred message">★</span>
                )}

                {
                    message.isDeleted ? (

                        <p className="deletedMessage">

                            🚫 This message was deleted

                        </p>

                    ) : (

                        <>

                            {/* Reply Preview */}
                            {

                                message.replyTo && (

                                    <div className="replyBox">

                                        <strong>

                                            {message.replyTo.sender?.firstName}

                                        </strong>

                                        <p>

                                            {

                                                message.replyTo.message ||

                                                "📎 Attachment"

                                            }

                                        </p>

                                    </div>

                                )

                            }

                            {/* Current Message */}

                            {

                                message.message && (

                                    <p>

                                        {message.message}

                                    </p>

                                )

                            }

                            {

                                message.file && (

                                    isImage ? (

                                        <img
                                            src={message.file}
                                            alt="chat"
                                            className="chatImage"
                                        />

                                    ) : (

                                        <a
                                            href={message.file}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="chatFile"
                                        >

                                            📎 Download Attachment

                                        </a>

                                    )

                                )

                            }

                        </>

                    )

                }

                <div className="messageFooter">

                    <small>

                        {

                            new Date(

                                message.createdAt

                            ).toLocaleTimeString(

                                [],

                                {

                                    hour: "2-digit",

                                    minute: "2-digit"

                                }

                            )

                        }

                    </small>

                    {

                        isMine && (

                            <span

                                className={

                                    message.seen

                                        ? "seen"

                                        : message.delivered

                                            ? "delivered"

                                            : "sent"

                                }

                            >

                                {

                                    message.seen

                                        ? "✓✓"

                                        : message.delivered

                                            ? "✓✓"

                                            : "✓"

                                }

                            </span>

                        )

                    }

                </div>

            </div>

        </div>

    );

}