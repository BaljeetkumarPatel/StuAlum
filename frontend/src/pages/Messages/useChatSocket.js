// src/pages/Messages/useChatSocket.js

import { useEffect, useRef } from "react";
import { io } from "socket.io-client";

// DIRECT URL
const SOCKET_URL = "http://localhost:5000";

export default function useChatSocket(token, handlers = {}) {
  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = io(SOCKET_URL, {
      auth: { token },
    });

    socketRef.current.on("connect", () => {
      console.log("Socket connected:", socketRef.current.id);
    });

    // Register all handlers
    Object.entries(handlers).forEach(([event, fn]) => {
      socketRef.current.on(event, fn);
    });

    return () => {
      if (socketRef.current) {
        Object.entries(handlers).forEach(([event, fn]) => {
          socketRef.current.off(event, fn);
        });
        socketRef.current.disconnect();
      }
    };
  }, [token]);

  return socketRef;
}
