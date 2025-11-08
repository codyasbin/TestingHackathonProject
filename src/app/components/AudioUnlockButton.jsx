// components/AudioUnlockButton.jsx
"use client";

import { useState, useEffect } from "react";

/**
 * This component shows a one-time button to unlock audio playback
 * Place it in your layout or main page component
 * Once clicked, audio will work for the rest of the session
 */
export default function AudioUnlockButton() {
  const [showButton, setShowButton] = useState(false);
  const [audioReady, setAudioReady] = useState(false);
  const userRole = typeof window !== "undefined" ? localStorage.getItem("role") : null;

  useEffect(() => {
    // Check if audio has already been unlocked in this session
    const isUnlocked = sessionStorage.getItem("audioUnlocked");
    
    if (isUnlocked === "true") {
      setAudioReady(true);
      return;
    }

    // Show button after a short delay
    const timer = setTimeout(() => {
      setShowButton(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleUnlock = async () => {
    try {
      // Create a temporary audio element and play it
      const audio = new Audio("/ringtone.mp3");
      audio.volume = 0.01; // Very quiet, just to unlock
      await audio.play();
      audio.pause();
      
      // Mark as unlocked
      sessionStorage.setItem("audioUnlocked", "true");
      setAudioReady(true);
      setShowButton(false);
      
      console.log("✅ Audio unlocked for this session");
    } catch (error) {
      console.error("Failed to unlock audio:", error);
    }
  };

  if (audioReady || !showButton || userRole !== "provider") {
    return null;
  }

  return (
    <div style={overlayStyle}>
      <div style={cardStyle}>
        <div style={iconStyle}>🔊</div>
        <h3 style={titleStyle}>Enable Call Notifications</h3>
        <p style={descriptionStyle}>
          Click below to enable ringtone for incoming calls
        </p>
        <button onClick={handleUnlock} style={buttonStyle}>
          Enable Sound
        </button>
        <button 
          onClick={() => setShowButton(false)} 
          style={skipButtonStyle}
        >
          Skip (calls will be silent)
        </button>
      </div>
    </div>
  );
}

const overlayStyle = {
  position: "fixed",
  inset: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 10000,
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  backdropFilter: "blur(4px)",
  animation: "fadeIn 0.3s ease-in-out",
};

const cardStyle = {
  background: "white",
  padding: 32,
  borderRadius: 16,
  boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
  maxWidth: 400,
  textAlign: "center",
  animation: "slideUp 0.4s ease-out",
};

const iconStyle = {
  fontSize: 48,
  marginBottom: 16,
};

const titleStyle = {
  fontSize: 22,
  fontWeight: 700,
  color: "#1f2937",
  marginBottom: 12,
};

const descriptionStyle = {
  fontSize: 14,
  color: "#6b7280",
  marginBottom: 24,
  lineHeight: 1.6,
};

const buttonStyle = {
  width: "100%",
  padding: "14px 24px",
  backgroundColor: "#10b981",
  color: "white",
  border: "none",
  borderRadius: 10,
  cursor: "pointer",
  fontSize: 16,
  fontWeight: 600,
  marginBottom: 12,
  transition: "all 0.2s ease",
};

const skipButtonStyle = {
  width: "100%",
  padding: "10px 24px",
  backgroundColor: "transparent",
  color: "#6b7280",
  border: "none",
  cursor: "pointer",
  fontSize: 14,
  textDecoration: "underline",
};

// Add animations
if (typeof document !== "undefined") {
  const style = document.createElement("style");
  style.innerHTML = `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes slideUp {
      from {
        transform: translateY(30px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }
  `;
  document.head.appendChild(style);
}