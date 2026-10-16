import { io } from "socket.io-client";

const testing = false;
const serverSideURI =
    process.env.NEXT_PUBLIC_API_URL ||
    "https://tech-monster-dev.onrender.com/api";

const API_URL = testing ? "http://localhost:8001/api" : serverSideURI;

const SOCKET_URL = API_URL.replace(/\/api\/?$/, "");

export const socket = io(
    SOCKET_URL,
    {
        autoConnect: false,
        withCredentials: true,
        transports: ["websocket", "polling"]
    }
);
