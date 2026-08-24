import { io } from "socket.io-client";

const API_URL = import.meta.env.VITE_API_URL || "https://tech-monster-backend.onrender.com/api";

const SOCKET_URL = API_URL.replace(/\/api\/?$/, "");

export const socket = io(
    SOCKET_URL,
    {
        autoConnect: false,
        withCredentials: true,
        transports: ["websocket", "polling"]
    }
);