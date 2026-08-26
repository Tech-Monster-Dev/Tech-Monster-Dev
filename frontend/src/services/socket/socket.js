import { io } from "socket.io-client";

const serverSideURI = "https://tech-monster-dev.onrender.com/api";
const testing = true;

const API_URL = testing ? "http://localhost:8001/api" : serverSideURI || import.meta.env.VITE_API_URL;

const SOCKET_URL = API_URL.replace(/\/api\/?$/, "");

export const socket = io(
    SOCKET_URL,
    {
        autoConnect: false,
        withCredentials: true,
        transports: ["websocket", "polling"]
    }
);