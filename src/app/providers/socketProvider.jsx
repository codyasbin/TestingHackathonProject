// components/SocketProvider.jsx
"use client";

import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { getSocket } from "@/lib/socket";

const SocketContext = createContext(null);
export function useSocket() { return useContext(SocketContext); }

export default function SocketProvider({ children }) {
  const [ready, setReady] = useState(false);
  const [incomingInvite, setIncomingInvite] = useState(null);
  const [notificationPermission, setNotificationPermission] = useState("default");
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const socketRef = useRef(null);
  const pollingIntervalRef = useRef(null);
  const lastCheckedRef = useRef(null);
  const audioRef = useRef(null);
  const router = useRouter();
  const userRole = typeof window !== "undefined" ? localStorage.getItem("role") : null;

  const baseUri = process.env.NEXT_PUBLIC_BACKEND_URL || "";

  // Unlock audio on first user interaction
  useEffect(() => {
    if (typeof window === "undefined") return;

    const unlockAudio = async () => {
      if (audioRef.current && !audioUnlocked) {
        try {
          // Try to play and immediately pause
          await audioRef.current.play();
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
          setAudioUnlocked(true);
          console.log("✅ Audio unlocked");
        } catch (error) {
          console.log("Audio unlock attempt failed, will retry on next interaction");
        }
      }
    };

    // Events that indicate user interaction
    const events = ['click', 'touchstart', 'keydown', 'mousedown'];
    
    events.forEach(event => {
      document.addEventListener(event, unlockAudio, { once: true });
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, unlockAudio);
      });
    };
  }, [audioUnlocked]);

  // Request notification permission on mount
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setNotificationPermission(Notification.permission);
      
      if (Notification.permission === "default") {
        Notification.requestPermission().then((permission) => {
          setNotificationPermission(permission);
        });
      }
    }

    // Initialize audio element
    if (typeof window !== "undefined") {
      audioRef.current = new Audio("/ringtone.mp3");
      audioRef.current.loop = true;
      audioRef.current.volume = 1.0;
      
      // Preload the audio
      audioRef.current.load();
    }

    return () => {
      // Cleanup audio on unmount
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Function to play ringtone
  const playRingtone = async () => {
    if (audioRef.current) {
      try {
        await audioRef.current.play();
        console.log("🎵 Ringtone playing");
      } catch (error) {
        console.warn("⚠️ Ringtone autoplay blocked:", error.message);
        // If autoplay is blocked, the user will still see the visual notification
        // Audio will play once they interact with the accept/deny buttons
      }
    }
  };

  // Function to stop ringtone
  const stopRingtone = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  // Function to show browser notification
  const showNotification = (data) => {
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
      const notification = new Notification("📞 Incoming Call - Sahayog", {
        body: "You have an incoming video call. Click to view.",
        icon: "/logo.png", // Add your logo path here
        badge: "/badge.png", // Optional: small icon for mobile
        tag: "incoming-call", // Prevents duplicate notifications
        requireInteraction: true, // Notification stays until user interacts
        silent: false, // Play system sound
        vibrate: [200, 100, 200], // Vibration pattern for mobile
        data: {
          url: "/online-room",
          timestamp: data.updatedAt
        }
      });

      // Handle notification click
      notification.onclick = () => {
        window.focus();
        acceptInvite();
        notification.close();
      };

      // Auto-close notification after 60 seconds
      setTimeout(() => {
        notification.close();
      }, 60000);
    }
  };

  // Poll API for incoming call status
  useEffect(() => {
    const checkIncomingCall = async () => {
      try {
        const response = await fetch(`${baseUri}/api/incoming-call`);
        const result = await response.json();

        if (result.success && result.data) {
          const { incomingCall, updatedAt } = result.data;
          
          if (incomingCall) {
            const updatedTime = new Date(updatedAt).getTime();
            const currentTime = Date.now();
            const timeDifferenceInMinutes = (currentTime - updatedTime) / (1000 * 60);

            if (timeDifferenceInMinutes < 1) {
              if (lastCheckedRef.current !== updatedAt) {
                console.log("🔔 Incoming call detected!", result.data);
                
                // Set incoming invite
                setIncomingInvite({
                  incomingCall,
                  updatedAt,
                  message: "You have an incoming video call"
                });
                
                // Play ringtone
                playRingtone();
                
                // Show browser notification
                showNotification(result.data);
                
                lastCheckedRef.current = updatedAt;
              }
            } else {
              if (incomingInvite) {
                console.log("⏰ Call expired (older than 1 minute)");
                stopRingtone();
                setIncomingInvite(null);
              }
            }
          } else {
            if (incomingInvite) {
              stopRingtone();
              setIncomingInvite(null);
            }
          }
        }
      } catch (error) {
        console.error("❌ Error checking incoming call:", error);
      }
    };

    checkIncomingCall();
    pollingIntervalRef.current = setInterval(checkIncomingCall, 3000);

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
      stopRingtone();
    };
  }, [incomingInvite]);

  // Socket connection handling
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
      // Stop ringtone
      stopRingtone();
      
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
      // Stop ringtone
      stopRingtone();
      
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
      {incomingInvite && userRole === "provider" && (
        <div style={overlayStyle}>
          <div style={cardStyle}>
            {/* Audio blocked warning */}
            {!audioUnlocked && (
              <div style={audioWarningStyle}>
                🔇 Click anywhere to enable ringtone
              </div>
            )}
            
            {/* Animated pulse effect */}
            <div style={pulseCircleStyle}></div>
            
            {/* Phone icon with animation */}
            <div style={iconContainerStyle}>
              <div style={phoneIconStyle}>📞</div>
            </div>
            
            {/* Call information */}
            <h2 style={titleStyle}>Incoming Online Meeting Request</h2>
            <p style={messageStyle}>{incomingInvite.message}</p>
            <p style={timestampStyle}>
              Received: {new Date(incomingInvite.updatedAt).toLocaleTimeString()}
            </p>
            
            {/* Action buttons */}
            <div style={buttonContainerStyle}>
              <button 
                onClick={acceptInvite}
                style={acceptButtonStyle}
                onMouseEnter={(e) => e.target.style.transform = "scale(1.05)"}
                onMouseLeave={(e) => e.target.style.transform = "scale(1)"}
              >
                <span style={{ fontSize: 20, marginRight: 8 }}>✓</span>
                Accept
              </button>
              <button 
                onClick={denyInvite}
                style={denyButtonStyle}
                onMouseEnter={(e) => e.target.style.transform = "scale(1.05)"}
                onMouseLeave={(e) => e.target.style.transform = "scale(1)"}
              >
                <span style={{ fontSize: 20, marginRight: 8 }}>✗</span>
                Decline
              </button>
            </div>
            
            {/* Notification permission message */}
            {notificationPermission !== "granted" && (
              <p style={permissionMessageStyle}>
                💡 Enable notifications for incoming calls
              </p>
            )}
          </div>
        </div>
      )}
    </SocketContext.Provider>
  );
}

// Enhanced styles with animations
const overlayStyle = {
  position: "fixed", 
  inset: 0, 
  display: "flex", 
  alignItems: "center", 
  justifyContent: "center",
  zIndex: 9999, 
  pointerEvents: "auto",
  backgroundColor: "rgba(0, 0, 0, 0.75)",
  backdropFilter: "blur(8px)",
  animation: "fadeIn 0.3s ease-in-out",
};

const cardStyle = {
  background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)", 
  padding: "40px 32px", 
  borderRadius: 24, 
  boxShadow: "0 20px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.1)", 
  minWidth: 380,
  maxWidth: 450,
  textAlign: "center",
  position: "relative",
  animation: "slideUp 0.4s ease-out",
  border: "2px solid rgba(16, 185, 129, 0.2)",
};

const pulseCircleStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 300,
  height: 300,
  borderRadius: "50%",
  background: "radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, rgba(16, 185, 129, 0) 70%)",
  animation: "pulse 2s ease-in-out infinite",
  pointerEvents: "none",
};

const iconContainerStyle = {
  position: "relative",
  marginBottom: 24,
  display: "inline-block",
};

const phoneIconStyle = {
  fontSize: 64,
  display: "inline-block",
  animation: "shake 0.5s ease-in-out infinite",
  filter: "drop-shadow(0 4px 8px rgba(16, 185, 129, 0.3))",
};

const titleStyle = {
  fontSize: 26,
  fontWeight: 700,
  color: "#1f2937",
  marginBottom: 12,
  letterSpacing: "-0.5px",
};

const messageStyle = {
  fontSize: 16,
  color: "#6b7280",
  marginBottom: 8,
  fontWeight: 500,
};

const timestampStyle = {
  fontSize: 13,
  color: "#9ca3af",
  marginBottom: 32,
  fontStyle: "italic",
};

const buttonContainerStyle = {
  display: "flex",
  gap: 12,
  marginTop: 24,
};

const acceptButtonStyle = {
  flex: 1,
  padding: "16px 24px",
  backgroundColor: "#10b981",
  color: "white",
  border: "none",
  borderRadius: 12,
  cursor: "pointer",
  fontSize: 16,
  fontWeight: 700,
  transition: "all 0.2s ease",
  boxShadow: "0 4px 12px rgba(16, 185, 129, 0.4)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const denyButtonStyle = {
  flex: 1,
  padding: "16px 24px",
  backgroundColor: "#ef4444",
  color: "white",
  border: "none",
  borderRadius: 12,
  cursor: "pointer",
  fontSize: 16,
  fontWeight: 700,
  transition: "all 0.2s ease",
  boxShadow: "0 4px 12px rgba(239, 68, 68, 0.4)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const permissionMessageStyle = {
  marginTop: 16,
  fontSize: 12,
  color: "#f59e0b",
  backgroundColor: "#fef3c7",
  padding: "8px 12px",
  borderRadius: 8,
  border: "1px solid #fde68a",
};

const audioWarningStyle = {
  position: "absolute",
  top: -12,
  left: "50%",
  transform: "translateX(-50%)",
  backgroundColor: "#f59e0b",
  color: "white",
  padding: "6px 16px",
  borderRadius: 20,
  fontSize: 12,
  fontWeight: 600,
  boxShadow: "0 4px 12px rgba(245, 158, 11, 0.4)",
  animation: "bounce 1s ease-in-out infinite",
  whiteSpace: "nowrap",
  zIndex: 10,
};

// Add CSS animations via a style tag
if (typeof document !== "undefined") {
  const styleTag = document.createElement("style");
  styleTag.innerHTML = `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    @keyframes slideUp {
      from {
        transform: translateY(50px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }
    
    @keyframes shake {
      0%, 100% { transform: rotate(0deg); }
      10%, 30%, 50%, 70%, 90% { transform: rotate(-10deg); }
      20%, 40%, 60%, 80% { transform: rotate(10deg); }
    }
    
    @keyframes pulse {
      0%, 100% {
        transform: translate(-50%, -50%) scale(0.95);
        opacity: 0.5;
      }
      50% {
        transform: translate(-50%, -50%) scale(1.05);
        opacity: 0.3;
      }
    }
    
    @keyframes bounce {
      0%, 100% {
        transform: translateX(-50%) translateY(0);
      }
      50% {
        transform: translateX(-50%) translateY(-5px);
      }
    }
  `;
  document.head.appendChild(styleTag);
}