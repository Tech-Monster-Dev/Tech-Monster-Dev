import { useState } from "react";

import "./ChatSidebar.css";
import EmptyState from "../../../../../components/ui/EmptyState";

export default function ChatSidebar({

    users = [],

    selectedUser,

    openChat,

    onlineUsers = []

}) {

    const [search, setSearch] = useState("");

    const filteredUsers = users.filter(user => {

        const fullName =

            `${user.firstName} ${user.lastName}`

                .toLowerCase();

        return fullName.includes(

            search.toLowerCase()

        );

    });

    return (

        <div className="chatSidebar">

            <h2>

                Messages

            </h2>

            <input

                className="chatSearch"

                type="text"

                placeholder="Search user..."

                value={search}

                onChange={(e) =>

                    setSearch(

                        e.target.value

                    )

                }

            />

            <div className="chatUserList">

                {

                    filteredUsers.length === 0 ?

                        (

                            <EmptyState
                                compact
                                heading="No Users Found"
                                paragraph="There are no users available to start a conversation with right now."
                            />

                        )

                        :

                        filteredUsers.map(user => {

                            const isOnline =

                                onlineUsers.includes(

                                    user._id

                                );

                            return (

                                <div

                                    key={user._id}

                                    className={

                                        `chatUser ${selectedUser?._id === user._id

                                            ? "active"

                                            : ""

                                        }`

                                    }

                                    onClick={() =>

                                        openChat(user)

                                    }

                                >

                                    <div className="chatAvatarBox">

                                        <img

                                            src={

                                                user.profileImage ||

                                                "/default-avatar.png"

                                            }

                                            alt="profile"

                                            className="chatAvatar"

                                        />

                                        {

                                            isOnline &&

                                            <span

                                                className="onlineDot"

                                            />

                                        }

                                    </div>

                                    <div className="chatUserInfo">

                                        <h4>

                                            {user.firstName}{" "}

                                            {user.lastName}

                                        </h4>

                                        <small>

                                            {

                                                user.lastMessage

                                                    ?

                                                    user.lastMessage.text

                                                    :

                                                    "No messages"

                                            }

                                        </small>

                                        <span className="chatTime">

                                            {

                                                user.lastMessage

                                                    ?

                                                    new Date(

                                                        user.lastMessage.createdAt

                                                    ).toLocaleTimeString([], {

                                                        hour: "2-digit",

                                                        minute: "2-digit"

                                                    })

                                                    :

                                                    ""

                                            }

                                        </span>

                                        {

                                            user.unreadCount > 0 && (

                                                <div className="unreadBadge">

                                                    {user.unreadCount}

                                                </div>

                                            )

                                        }
                                        <small>

                                            {user.role}

                                        </small>

                                    </div>


                                </div>

                            );

                        })

                }

            </div>

        </div>

    );

}