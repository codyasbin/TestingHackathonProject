import { io } from "socket.io-client";

let socket = null;

export function getSocket() {
  if (typeof window === "undefined") return null;
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://10.10.148.34:3001", {
      transports: ["websocket"],
    });
  }
  return socket;
}