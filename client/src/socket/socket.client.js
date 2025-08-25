import io from "socket.io-client";

const SOCKET_URL = import.meta.env.MODE === "development" 
    ? "http://localhost:3001" 
    : window.location.origin;

let socket = null;

export const initializeSocket = (userId) => {
    if (socket) {
        socket.disconnect();
    }

    socket = io(SOCKET_URL, {
        auth: { userId },
        transports: ['websocket', 'polling'], // Enable fallback
        timeout: 20000,
        forceNew: true,
    });

    socket.on("connect", () => {
        console.log("Connected to socket server");
    });

    socket.on("disconnect", () => {
        console.log("Disconnected from socket server");
    });

    socket.on("connect_error", (error) => {
        console.error("Socket connection error:", error);
    });
};

export const getSocket = () => {
    if (!socket) {
        throw new Error("Socket not initialized");
    }
    return socket;
};

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};