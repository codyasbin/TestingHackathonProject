import { io } from "socket.io-client";

let socket = null;

export function getSocket() {
  if (typeof window === "undefined") return null;
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_BACKEND_URL || "", {
      transports: ["websocket"],
    });
  }
  return socket;
}