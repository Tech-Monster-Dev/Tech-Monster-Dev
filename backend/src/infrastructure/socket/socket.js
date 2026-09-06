import { Server } from "socket.io";

let io;

const onlineUsers = new Map();
const onlineUserActivity = new Map();
const activeChats = new Map();

const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:5199",
    "http://localhost:3000",

    "https://tech-monster-dev-lac.vercel.app"
];


// =====================================
// INITIALIZE SOCKET
// =====================================

export const initSocket = (server) => {

    io = new Server(server, {

        cors: {

            origin: allowedOrigins,

            methods: [
                "GET",
                "POST"
            ],

            credentials: true

        }

    });


    io.on("connection", (socket) => {

        console.log(
            "🟢 SOCKET CONNECTED:",
            socket.id
        );

        socket.on("join", (userId) => {

            console.log(
                "👤 SOCKET JOIN REQUEST:",
                userId
            );

            if (!userId) {
                console.log(
                    "❌ Join rejected: no userId"
                );
                return;
            }

            const id = String(userId);

            socket.join(id);

            onlineUsers.set(
                id,
                socket.id
            );

            onlineUserActivity.set(
                id,
                Date.now()
            );

            console.log(
                "✅ USER REGISTERED:",
                id,
                "=>",
                socket.id
            );

            console.log(
                "👥 ONLINE USERS:",
                Array.from(
                    onlineUsers.entries()
                )
            );

            io.emit(
                "onlineUsers",
                Array.from(
                    onlineUsers.keys()
                )
            );
        });

        socket.on("activeChat", ({ withUser }) => {
            const userId = Array.from(onlineUsers.entries()).find(([, socketId]) => socketId === socket.id)?.[0];
            if (!userId) return;

            if (withUser) {
                activeChats.set(String(userId), String(withUser));
            } else {
                activeChats.delete(String(userId));
            }
        });

        socket.on("typing", ({ receiver }) => {
            if (!receiver) return;
            const sender = Array.from(onlineUsers.entries()).find(([, socketId]) => socketId === socket.id)?.[0];
            if (!sender) return;
            io.to(String(receiver)).emit("typing", { sender: String(sender) });
        });

        socket.on("stopTyping", ({ receiver }) => {
            if (!receiver) return;
            const sender = Array.from(onlineUsers.entries()).find(([, socketId]) => socketId === socket.id)?.[0];
            if (!sender) return;
            io.to(String(receiver)).emit("stopTyping", { sender: String(sender) });
        });

        socket.on("disconnect", () => {

            console.log(
                "🔴 SOCKET DISCONNECTED:",
                socket.id
            );

            for (
                const [
                    userId,
                    socketId
                ] of onlineUsers.entries()
            ) {

                if (socketId === socket.id) {

                    onlineUsers.delete(
                        userId
                    );

                    activeChats.delete(
                        userId
                    );

                    onlineUserActivity.delete(
                        userId
                    );

                    console.log(
                        "❌ USER REMOVED:",
                        userId
                    );

                    break;
                }
            }
        });

    });

};


// =====================================
// GET SOCKET IO
// =====================================

export const getIO = () => {

    if (!io) {
        throw new Error(
            "Socket.io has not been initialized"
        );
    }

    return io;
};


// =====================================
// GET ONLINE USERS
// =====================================

export const getOnlineUserActivity = () => {

    return onlineUserActivity;

};


export const getOnlineUsers = () => {

    return onlineUsers;

};


export const getActiveChats = () => {

    return activeChats;

};


// =====================================
// EMIT TO SPECIFIC USER
// =====================================

export const emitToUser = (
    userId,
    event,
    payload
) => {

    if (!io) {

        console.log(
            "❌ Socket.IO is not initialized"
        );

        return;
    }

    const normalizedUserId =
        String(userId);

    const socketId =
        onlineUsers.get(
            normalizedUserId
        );

    console.log(
        "📡 EMIT TO USER:",
        {
            userId: normalizedUserId,
            socketId,
            event
        }
    );

    if (!socketId) {

        console.log(
            "❌ USER NOT ONLINE:",
            normalizedUserId
        );

        console.log(
            "👥 CURRENT ONLINE USERS:",
            Array.from(
                onlineUsers.entries()
            )
        );

        return;
    }

    io.to(socketId).emit(
        event,
        payload
    );

    console.log(
        "✅ NOTIFICATION SENT:",
        event,
        "=>",
        normalizedUserId
    );
};