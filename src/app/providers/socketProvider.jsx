// components/SocketProvider.jsx
"use client";

import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { getSocket } from "@/lib/socket";

const SocketContext = createContext(null);
export function useSocket() { return useContext(SocketContext); }

export default function SocketProvider({ children }) {
  const [ready, setReady] = useState(false);
  const [incomingInvite, setIncomingInvite] = useState(null); // { incomingCall: true/false, updatedAt }
  const socketRef = useRef(null);
  const pollingIntervalRef = useRef(null);
  const lastCheckedRef = useRef(null);
  const router = useRouter();

  const baseUri= "http://localhost:3001"

  // Poll API for incoming call status
  useEffect(() => {
    const checkIncomingCall = async () => {
      try {
        const response = await fetch(`${baseUri}/api/incoming-call`);
        const result = await response.json();

        if (result.success && result.data) {
          const { incomingCall, updatedAt } = result.data;
          
          // Check if the call is incoming and was updated within the last 1 minute
          if (incomingCall) {
            const updatedTime = new Date(updatedAt).getTime();
            const currentTime = Date.now();
            const timeDifferenceInMinutes = (currentTime - updatedTime) / (1000 * 60);

            // Show invite if updated within 1 minute and we haven't shown this one yet
            if (timeDifferenceInMinutes < 1) {
              // Only update if this is a new invite (different timestamp)
              if (lastCheckedRef.current !== updatedAt) {
                console.log("🔔 Incoming call detected!", result.data);
                setIncomingInvite({
                  incomingCall,
                  updatedAt,
                  message: "You have an incoming call"
                });
                lastCheckedRef.current = updatedAt;
              }
            } else {
              // Call is older than 1 minute, clear the invite
              if (incomingInvite) {
                console.log("⏰ Call expired (older than 1 minute)");
                setIncomingInvite(null);
              }
            }
          } else {
            // No incoming call
            if (incomingInvite) {
              setIncomingInvite(null);
            }
          }
        }
      } catch (error) {
        console.error("❌ Error checking incoming call:", error);
      }
    };

    // Check immediately on mount
    checkIncomingCall();

    // Poll every 3 seconds
    pollingIntervalRef.current = setInterval(checkIncomingCall, 3000);

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [incomingInvite]);

  // Socket connection handling (kept for other features like chat/WebRTC)
  useEffect(() => {
    const s = getSocket();
    if (!s) return;

    socketRef.current = s;

    const onConnect = () => setReady(true);
    const onDisconnect = () => setReady(false);

    s.on("connect", onConnect);
    s.on("disconnect", onDisconnect);
    s.on("error", (err) => console.error("socket error", err));

    return () => {
      s.off("connect", onConnect);
      s.off("disconnect", onDisconnect);
    };
  }, [router]);

  const acceptInvite = async () => {
    try {
      // Set incoming call to false when accepted
      await fetch(`${baseUri}/api/incoming-call`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ incomingCall: false })
      });
      
      setIncomingInvite(null);
      lastCheckedRef.current = null;
      
      // Navigate to the call room
      router.push("/online-room");
      
      console.log("✅ Call accepted");
    } catch (error) {
      console.error("❌ Error accepting call:", error);
    }
  };

  const denyInvite = async () => {
    try {
      // Set incoming call to false when denied
      await fetch(`${baseUri}/api/incoming-call`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ incomingCall: false })
      });
      
      setIncomingInvite(null);
      lastCheckedRef.current = null;
      
      console.log("❌ Call denied");
    } catch (error) {
      console.error("❌ Error denying call:", error);
    }
  };

  const value = { socket: socketRef.current, ready, incomingInvite };

  return (
    <SocketContext.Provider value={value}>
      {children}
      {incomingInvite && (
        <div style={overlayStyle}>
          <div style={cardStyle}>
            <p style={{ marginBottom: 8, fontSize: 18, fontWeight: "bold" }}>
              📞 Incoming Call
            </p>
            <p style={{ marginBottom: 8, color: "#666" }}>
              {incomingInvite.message}
            </p>
            <p style={{ marginBottom: 16, fontSize: 12, color: "#999" }}>
              Received: {new Date(incomingInvite.updatedAt).toLocaleTimeString()}
            </p>
            <div style={{ display: "flex", gap: 8 }}>
              <button 
                onClick={acceptInvite}
                style={acceptButtonStyle}
              >
                ✓ Accept
              </button>
              <button 
                onClick={denyInvite}
                style={denyButtonStyle}
              >
                ✗ Deny
              </button>
            </div>
          </div>
        </div>
      )}
    </SocketContext.Provider>
  );
}

const overlayStyle = {
  position: "fixed", 
  inset: 0, 
  display: "flex", 
  alignItems: "center", 
  justifyContent: "center",
  zIndex: 9999, 
  pointerEvents: "auto",
  backgroundColor: "rgba(0, 0, 0, 0.5)",
};

const cardStyle = {
  background: "white", 
  padding: 24, 
  borderRadius: 12, 
  boxShadow: "0 10px 40px rgba(0,0,0,0.3)", 
  minWidth: 320,
  maxWidth: 400,
};

const acceptButtonStyle = {
  flex: 1,
  padding: "10px 20px",
  backgroundColor: "#10b981",
  color: "white",
  border: "none",
  borderRadius: 6,
  cursor: "pointer",
  fontSize: 14,
  fontWeight: 600,
};

const denyButtonStyle = {
  flex: 1,
  padding: "10px 20px",
  backgroundColor: "#ef4444",
  color: "white",
  border: "none",
  borderRadius: 6,
  cursor: "pointer",
  fontSize: 14,
  fontWeight: 600,
};