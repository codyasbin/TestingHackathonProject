"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { getSocket } from "@/lib/socket";
import { Video, VideoOff, Mic, MicOff, Phone, PhoneOff, Users, MessageCircle, Settings } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LobbyPage() {
  // Chat state
  const [connected, setConnected] = useState(false);
  const [selfId, setSelfId] = useState(null);
  const [name, setName] = useState("");
  const [nameCommitted, setNameCommitted] = useState(false);
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const router = useRouter();
  const userData=typeof window !== "undefined" ? localStorage.getItem("currentUser") : null;
  const username = userData ? JSON.parse(userData).name : "User";

  // A/V state
  const [inCall, setInCall] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [avReady, setAvReady] = useState(false);

  const messagesEndRef = useRef(null);
  const localVideoRef = useRef(null);
  const localStreamRef = useRef(null);

  // Maps of peers
  const peerConnectionsRef = useRef(new Map());
  const remoteStreamsRef = useRef(new Map());
  const [remoteIds, setRemoteIds] = useState([]);

  const socket = useMemo(() => getSocket(), []);

  // Chat UI behavior
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!socket) return;

    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    socket.on("lobby_bootstrap", (payload) => {
      setSelfId(payload.selfId);
      setUsers(payload.users);
      setMessages(payload.messages);
    });

    socket.on("presence", (payload) => {
      setUsers(payload.users);
      const sysText = payload.type === "join" ? `${payload.name} joined` : `${payload.name} left`;
      setMessages((prev) => [...prev, { id: "system", name: "system", text: sysText, ts: Date.now() }]);
    });

    socket.on("message", (msg) => setMessages((prev) => [...prev, msg]));

    // WebRTC signaling handlers
    socket.on("webrtc_peer_ready", ({ id }) => {
      if (inCall && selfId && id !== selfId && localStreamRef.current) {
        createConnectionAndOffer(id);
      }
    });

    socket.on("webrtc_peer_left", ({ id }) => {
      cleanupPeer(id);
    });

    socket.on("webrtc_offer", async ({ from, sdp }) => {
      await ensureConnection(from);
      const pc = peerConnectionsRef.current.get(from);
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(sdp));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit("webrtc_answer", { to: from, sdp: pc.localDescription });
      } catch (e) {
        console.error("Error handling offer", e);
      }
    });

    socket.on("webrtc_answer", async ({ from, sdp }) => {
      const pc = peerConnectionsRef.current.get(from);
      if (!pc) return;
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(sdp));
      } catch (e) {
        console.error("Error setting remote answer", e);
      }
    });

    socket.on("webrtc_ice_candidate", async ({ from, candidate }) => {
      const pc = peerConnectionsRef.current.get(from);
      if (!pc || !candidate) return;
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (e) {
        console.error("Error adding ICE candidate", e);
      }
    });

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("lobby_bootstrap");
      socket.off("presence");
      socket.off("message");
      socket.off("webrtc_peer_ready");
      socket.off("webrtc_peer_left");
      socket.off("webrtc_offer");
      socket.off("webrtc_answer");
      socket.off("webrtc_ice_candidate");
    };
  }, [socket, inCall, selfId]);

  // Chat actions
  const joinLobby = () => {
    const trimmed = username.trim();
    if (!socket || !trimmed) return;
    socket.emit("join_lobby", { name: trimmed });
    setNameCommitted(true);
  };

  const sendMessage = () => {
    const t = draft.trim();
    if (!socket || !t) return;
    socket.emit("message", t);
    setDraft("");
  };

  // A/V helpers
  const rtcConfig = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
      { urls: "stun:stun2.l.google.com:19302" },
    ],
  };

  async function startLocalMedia() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      stream.getAudioTracks().forEach(t => (t.enabled = true));
      stream.getVideoTracks().forEach(t => (t.enabled = true));
      setMicOn(true);
      setCamOn(true);
      setAvReady(true);
    } catch (e) {
      console.error("getUserMedia error:", e);
      alert("Could not access camera/microphone. Check permissions.");
    }
  }

  function stopLocalMedia() {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(t => t.stop());
      localStreamRef.current = null;
    }
    setAvReady(false);
  }

  function cleanupPeer(id) {
    const pc = peerConnectionsRef.current.get(id);
    if (pc) {
      try { pc.close(); } catch {}
      peerConnectionsRef.current.delete(id);
    }
    const stream = remoteStreamsRef.current.get(id);
    if (stream) {
      stream.getTracks().forEach(t => t.stop());
      remoteStreamsRef.current.delete(id);
    }
    setRemoteIds(Array.from(remoteStreamsRef.current.keys()));
  }

  function cleanupAllPeers() {
    for (const id of peerConnectionsRef.current.keys()) {
      cleanupPeer(id);
    }
  }

  async function ensureConnection(peerId) {
    if (peerConnectionsRef.current.has(peerId)) return;

    const pc = new RTCPeerConnection(rtcConfig);

    pc.onicecandidate = (e) => {
      if (e.candidate) {
        socket.emit("webrtc_ice_candidate", { to: peerId, candidate: e.candidate });
      }
    };

    pc.ontrack = (e) => {
      let stream = remoteStreamsRef.current.get(peerId);
      if (!stream) {
        stream = new MediaStream();
        remoteStreamsRef.current.set(peerId, stream);
      }
      e.streams[0].getTracks().forEach((t) => stream.addTrack(t));
      setRemoteIds(Array.from(remoteStreamsRef.current.keys()));
    };

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        pc.addTrack(track, localStreamRef.current);
      });
    }

    peerConnectionsRef.current.set(peerId, pc);
  }

  async function createConnectionAndOffer(peerId) {
    await ensureConnection(peerId);
    const pc = peerConnectionsRef.current.get(peerId);
    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.emit("webrtc_offer", { to: peerId, sdp: pc.localDescription });
    } catch (e) {
      console.error("Error creating/sending offer", e);
    }
  }

  // A/V actions
  const handleStartAV = async () => {
    await startLocalMedia();
  };

  const handleJoinCall = async () => {
    if (!avReady || !users.length || !selfId) {
      alert("Pick a name, join lobby, and Start A/V first.");
      return;
    }
    setInCall(true);
    socket.emit("webrtc_join");

    const others = users.map(u => u.id).filter(id => id !== selfId);
    for (const peerId of others) {
      await createConnectionAndOffer(peerId);
    }
  };

  const handleLeaveCall = () => {
    setInCall(false);
    cleanupAllPeers();
  };

  const handleToggleMic = () => {
    if (!localStreamRef.current) return;
    const enabled = !micOn;
    localStreamRef.current.getAudioTracks().forEach(t => (t.enabled = enabled));
    setMicOn(enabled);
  };

  const handleToggleCam = () => {
    if (!localStreamRef.current) return;
    const enabled = !camOn;
    localStreamRef.current.getVideoTracks().forEach(t => (t.enabled = enabled));
    setCamOn(enabled);
  };

  const handleEndMeeting = () => {
    setInCall(false);
    cleanupAllPeers();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50">
      
        <header className="sticky top-0 z-40 mx-6 rounded-2xl bg-white/70 backdrop-blur-md border border-emerald-100 shadow-md">
          <div className="mx-auto max-w-7xl px-6 py-3">
            <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg">
              <Video className="h-6 w-6 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg font-extrabold text-gray-800 leading-tight">Sahayog Meet</h1>
              <div className="mt-1 flex items-center gap-3 text-sm">
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-0.5 text-emerald-700">
              <span
                className={`inline-block h-2 w-2 rounded-full ${connected ? "bg-emerald-500 animate-pulse" : "bg-red-400"}`}
                aria-hidden
              />
              {connected ? "Connected" : "Reconnecting..."}
            </span>

            <span className="hidden sm:inline text-xs text-gray-500">
              Real-time audio & video · Secure
            </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {nameCommitted ? (
              <>
            <div className="hidden sm:flex items-center gap-3 rounded-full bg-emerald-50 px-3 py-1">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-sm font-semibold text-white">
                {name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-medium text-emerald-800 truncate">{name}</div>
                <div className="text-xs text-emerald-600">You</div>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-2 rounded-full bg-white px-3 py-1 border border-gray-100 shadow-sm">
              <Users className="h-4 w-4 text-emerald-600" />
              <span className="text-sm text-gray-700">{users.length} participant{users.length !== 1 ? "s" : ""}</span>
            </div>

            <button
              onClick={handleEndMeeting}
              className="flex items-center gap-2 rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-red-700 transition-colors"
            >
              <PhoneOff className="h-4 w-4" />
              End Meeting
            </button>
              </>
            ) : (
              <div className="flex items-center gap-3">
            <div className="rounded-full bg-white px-3 py-1 text-sm text-gray-600 border border-gray-100 shadow-sm">
              Join to start
            </div>
              </div>
            )}

            <button
              className="hidden sm:inline-flex items-center justify-center rounded-full p-2 text-gray-600 hover:bg-gray-100 transition"
              title="Settings"
              aria-label="Settings"
            >
              <Settings className="h-5 w-5" />
            </button>
          </div>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-7xl p-6">
          {!nameCommitted ? (
          // Welcome Screen
          <div className="flex min-h-[80vh] items-center justify-center">
            <div className="w-full max-w-md">
              <div className="rounded-3xl bg-white p-8 shadow-2xl border border-emerald-100">
                <div className="mb-8 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg">
                    <Video className="h-8 w-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800">Join Meeting</h2>
                  <p className="mt-2 text-sm text-gray-600">Enter your name to get started</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">Your Name</label>
                    <input
                      value={username}
                     disabled
                      placeholder="e.g. Alex"
                      onKeyDown={(e) => e.key === "Enter" && joinLobby()}
                      className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-800 placeholder-gray-400 outline-none transition-all focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                    />
                  </div>

                  <button
                    onClick={joinLobby}
                    // disabled={!name.trim()}
                    className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
                  >
                    Join Meeting
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Main Meeting Interface
          <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
            {/* Main Content */}
            <div className="space-y-6">
              {/* Video Grid */}
              <div className="rounded-2xl bg-white p-6 shadow-lg border border-emerald-100">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800">
                    <Video className="h-5 w-5 text-emerald-600" />
                    Video Conference
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="h-4 w-4" />
                    <span>{remoteIds.length + 1} participant{remoteIds.length + 1 !== 1 ? 's' : ''}</span>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {/* Local Video */}
                  <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-900 to-gray-800 shadow-lg">
                    <video
                      ref={localVideoRef}
                      autoPlay
                      playsInline
                      muted
                      className={`aspect-video w-full object-cover ${!camOn ? 'opacity-0' : ''}`}
                    />
                    {!camOn && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500">
                          <span className="text-2xl font-bold text-white">{name.charAt(0).toUpperCase()}</span>
                        </div>
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-white">You</span>
                        <div className="flex gap-1">
                          {!micOn && <MicOff className="h-4 w-4 text-red-400" />}
                          {!camOn && <VideoOff className="h-4 w-4 text-red-400" />}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Remote Videos */}
                  {remoteIds.map((id) => (
                    <RemoteVideo key={id} peerId={id} streamsRef={remoteStreamsRef} />
                  ))}
                </div>
              </div>

              {/* Controls Bar */}
              {avReady && (
                <div className="rounded-2xl bg-white p-6 shadow-lg border border-emerald-100">
                  <div className="flex flex-wrap items-center justify-center gap-3">
                    {!inCall ? (
                      <button
                        onClick={handleJoinCall}
                        className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:scale-105"
                      >
                        <Phone className="h-5 w-5" />
                        Join Call
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={handleToggleMic}
                          className={`flex items-center gap-2 rounded-xl px-6 py-3 font-semibold shadow-md transition-all hover:scale-105 ${
                            micOn
                              ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              : 'bg-red-500 text-white hover:bg-red-600'
                          }`}
                        >
                          {micOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
                          {micOn ? 'Mute' : 'Unmute'}
                        </button>

                        <button
                          onClick={handleToggleCam}
                          className={`flex items-center gap-2 rounded-xl px-6 py-3 font-semibold shadow-md transition-all hover:scale-105 ${
                            camOn
                              ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              : 'bg-red-500 text-white hover:bg-red-600'
                          }`}
                        >
                          {camOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
                          {camOn ? 'Stop Video' : 'Start Video'}
                        </button>

                        <button
                          onClick={handleLeaveCall}
                          className="flex items-center gap-2 rounded-xl bg-red-500 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:bg-red-600 hover:scale-105"
                        >
                          <PhoneOff className="h-5 w-5" />
                          Leave Call
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}

              {!avReady && (
                <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 p-6 border border-emerald-200">
                  <div className="text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500">
                      <Video className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="mb-2 text-lg font-semibold text-gray-800">Ready to join?</h3>
                    <p className="mb-4 text-sm text-gray-600">Enable your camera and microphone to start</p>
                    <button
                      onClick={handleStartAV}
                      className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:scale-105"
                    >
                      Enable Camera & Mic
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Participants */}
              <div className="rounded-2xl bg-white p-6 shadow-lg border border-emerald-100">
                <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-800">
                  <Users className="h-5 w-5 text-emerald-600" />
                  Participants ({users.length})
                </h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {users.map((u) => (
                    <div
                      key={u.id}
                      className={`flex items-center gap-3 rounded-xl p-3 transition-colors ${
                        u.id === selfId ? 'bg-emerald-50' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-sm font-bold text-white">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-800">{u.name}</span>
                          {u.id === selfId && (
                            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                              You
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                          Online
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chat */}
              <div className="rounded-2xl bg-white shadow-lg border border-emerald-100 flex flex-col h-[500px]">
                <div className="border-b border-gray-200 p-4">
                  <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800">
                    <MessageCircle className="h-5 w-5 text-emerald-600" />
                    Chat
                  </h3>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.map((m, i) => (
                    <div key={i}>
                      {m.name === "system" ? (
                        <div className="text-center">
                          <span className="inline-block rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600">
                            {m.text}
                          </span>
                        </div>
                      ) : (
                        <div className={`flex gap-2 ${m.id === selfId ? 'flex-row-reverse' : ''}`}>
                          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-xs font-bold text-white">
                            {m.name.charAt(0).toUpperCase()}
                          </div>
                          <div className={`flex-1 ${m.id === selfId ? 'text-right' : ''}`}>
                            <div className="mb-1 flex items-baseline gap-2">
                              <span className="text-xs font-semibold text-gray-700">{m.name}</span>
                              <span className="text-xs text-gray-400">
                                {new Date(m.ts).toLocaleTimeString()}
                              </span>
                            </div>
                            <div
                              className={`inline-block rounded-2xl px-4 py-2 text-sm ${
                                m.id === selfId
                                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {m.text}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                <div className="border-t border-gray-200 p-4">
                  <div className="flex gap-2">
                    <input
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      placeholder="Type a message..."
                      onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                      className="flex-1 rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm outline-none transition-all focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!draft.trim()}
                      className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-2 font-semibold text-white transition-all hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Send
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/** Remote video component with enhanced styling */
function RemoteVideo({ peerId, streamsRef }) {
  const vidRef = useRef(null);
  const [hasVideo, setHasVideo] = useState(false);

  useEffect(() => {
    const stream = streamsRef.current.get(peerId) || null;
    if (vidRef.current && stream) {
      vidRef.current.srcObject = stream;
      
      // Check if stream has video tracks
      const videoTracks = stream.getVideoTracks();
      setHasVideo(videoTracks.length > 0 && videoTracks[0].enabled);
    }
  }, [peerId, streamsRef]);

  return (
    <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-900 to-gray-800 shadow-lg">
      <video
        ref={vidRef}
        autoPlay
        playsInline
        className={`aspect-video w-full object-cover ${!hasVideo ? 'opacity-0' : ''}`}
      />
      {!hasVideo && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-teal-500">
            <span className="text-2xl font-bold text-white">{peerId.charAt(0).toUpperCase()}</span>
          </div>
        </div>
      )}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-white">Peer {peerId.slice(0, 6)}</span>
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}