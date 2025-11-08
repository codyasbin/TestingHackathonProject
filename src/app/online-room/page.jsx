"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { getSocket } from "@/lib/socket";

export default function LobbyPage() {
  // Chat state (unchanged)
  const [connected, setConnected] = useState(false);
  const [selfId, setSelfId] = useState(null);
  const [name, setName] = useState("");
  const [nameCommitted, setNameCommitted] = useState(false);
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");

  // A/V state
  const [inCall, setInCall] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [avReady, setAvReady] = useState(false); // local media ready

  const messagesEndRef = useRef(null);
  const localVideoRef = useRef(null);
  const localStreamRef = useRef(null);

  // Maps of peers: id -> RTCPeerConnection / MediaStream
  const peerConnectionsRef = useRef(new Map());
  const remoteStreamsRef = useRef(new Map()); // id -> MediaStream
  const [remoteIds, setRemoteIds] = useState([]); // to render grid

  const socket = useMemo(() => getSocket(), []);

  // ====== Chat UI behavior ======
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

    // ====== WebRTC signaling handlers ======
    socket.on("webrtc_peer_ready", ({ id }) => {
      // A new peer is ready. If we are in-call and have local media, initiate a call to them.
      if (inCall && selfId && id !== selfId && localStreamRef.current) {
        createConnectionAndOffer(id);
      }
    });

    socket.on("webrtc_peer_left", ({ id }) => {
      // tear down peer
      cleanupPeer(id);
    });

    socket.on("webrtc_offer", async ({ from, sdp }) => {
      await ensureConnection(from);
      const pc = peerConnectionsRef.current.get(from);
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(sdp));
        // create answer
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

  // ====== Chat actions ======
  const joinLobby = () => {
    const trimmed = name.trim();
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

  // ====== A/V helpers ======
 const rtcConfig = {
  iceServers: [
    // STUN only (safe for local dev)
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },

    // If/when you add TURN (for production/NAT traversal), use this pattern:
    // {
    //   urls: "turn:your.turn.server:3478",
    //   username: "TURN_USERNAME",
    //   credential: "TURN_PASSWORD"
    // }
  ],
};

  async function startLocalMedia() {
    try {
      // Ask for mic+camera
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      // default state
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

    // When ICE candidates are found, send them to the peer
    pc.onicecandidate = (e) => {
      if (e.candidate) {
        socket.emit("webrtc_ice_candidate", { to: peerId, candidate: e.candidate });
      }
    };

    // When we get a remote track, attach it
    pc.ontrack = (e) => {
      let stream = remoteStreamsRef.current.get(peerId);
      if (!stream) {
        stream = new MediaStream();
        remoteStreamsRef.current.set(peerId, stream);
      }
      // Add all tracks from this event
      e.streams[0].getTracks().forEach((t) => stream.addTrack(t));
      setRemoteIds(Array.from(remoteStreamsRef.current.keys()));
    };

    // Add our local tracks
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

  // ====== A/V actions ======
  // 1) Start A/V (get devices)
  const handleStartAV = async () => {
    await startLocalMedia();
  };

  // 2) Join call (mesh): tell others we're ready, then initiate offers to everyone currently online (except us)
  const handleJoinCall = async () => {
    if (!avReady || !users.length || !selfId) {
      alert("Pick a name, join lobby, and Start A/V first.");
      return;
    }
    setInCall(true);
    socket.emit("webrtc_join");

    // initiate calls to all current users (except self)
    const others = users.map(u => u.id).filter(id => id !== selfId);
    for (const peerId of others) {
      await createConnectionAndOffer(peerId);
    }
  };

  // 3) Leave call
  const handleLeaveCall = () => {
    setInCall(false);
    cleanupAllPeers();
    // keep local media running; or stop it if you want full off:
    // stopLocalMedia();
  };

  // 4) Toggle mic
  const handleToggleMic = () => {
    if (!localStreamRef.current) return;
    const enabled = !micOn;
    localStreamRef.current.getAudioTracks().forEach(t => (t.enabled = enabled));
    setMicOn(enabled);
  };

  // 5) Toggle cam
  const handleToggleCam = () => {
    if (!localStreamRef.current) return;
    const enabled = !camOn;
    localStreamRef.current.getVideoTracks().forEach(t => (t.enabled = enabled));
    setCamOn(enabled);
  };

  return (
    <div className="grid min-h-screen grid-cols-[320px_1fr] gap-3 p-4 bg-gray-50 text-slate-900">
      {/* Sidebar */}
      <aside className="rounded-2xl bg-white p-4 shadow">
        <div className="mb-2 text-lg font-bold">Lobby</div>
        <div className="mb-4 text-xs opacity-70">
          {connected ? "🟢 Connected" : "🔴 Disconnected"}
        </div>

        {!nameCommitted ? (
          <div className="grid gap-2">
            <label className="text-sm opacity-80">Pick a name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Alex"
              onKeyDown={(e) => e.key === "Enter" && joinLobby()}
              className="rounded-xl border border-gray-300 bg-white px-3 py-2 outline-none"
            />
            <button
              onClick={joinLobby}
              className="rounded-xl bg-blue-600 px-3 py-2 font-semibold text-white hover:bg-blue-500"
            >
              Join Lobby
            </button>
          </div>
        ) : (
          <>
            <div className="grid gap-3">
              <div className="text-sm opacity-90">
                You: <b>{name}</b>
              </div>

              {/* A/V Controls */}
              <div className="mt-2 grid gap-2">
                <div className="text-sm font-semibold">Audio/Video</div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={handleStartAV}
                    disabled={avReady}
                    className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white disabled:bg-gray-200 disabled:text-slate-500"
                  >
                    {avReady ? "Devices Ready" : "Start A/V"}
                  </button>
                  <button
                    onClick={handleJoinCall}
                    disabled={!avReady || inCall}
                    className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white disabled:bg-gray-200 disabled:text-slate-500"
                  >
                    Join Call
                  </button>
                  <button
                    onClick={handleLeaveCall}
                    disabled={!inCall}
                    className="rounded-lg bg-rose-600 px-3 py-2 text-sm font-semibold text-white disabled:bg-gray-200 disabled:text-slate-500"
                  >
                    Leave
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={handleToggleMic}
                    disabled={!avReady}
                    className="rounded-lg bg-gray-100 px-3 py-2 text-sm font-semibold text-slate-900 disabled:bg-gray-50 disabled:text-slate-400"
                  >
                    {micOn ? "Mute Mic" : "Unmute Mic"}
                  </button>
                  <button
                    onClick={handleToggleCam}
                    disabled={!avReady}
                    className="rounded-lg bg-gray-100 px-3 py-2 text-sm font-semibold text-slate-900 disabled:bg-gray-50 disabled:text-slate-400"
                  >
                    {camOn ? "Turn Camera Off" : "Turn Camera On"}
                  </button>
                </div>
              </div>

              {/* Online list */}
              <div className="mt-4 font-semibold">Online</div>
              <div className="grid max-h-[40vh] gap-1 overflow-y-auto pr-1">
                {users.map((u) => (
                  <div
                    key={u.id}
                    className={`flex items-center gap-2 rounded-lg px-2 py-1 ${u.id === selfId ? "bg-gray-100" : ""}`}
                  >
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span className="text-sm">
                      {u.name}{u.id === selfId ? " (you)" : ""}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-2">Total: {users.length} user{users.length !== 1 ? "s" : ""}</div>
            </div>
          </>
        )}
      </aside>

      {/* Main area: Chat + Videos */}
      <main className="grid grid-rows-[auto_1fr_auto] gap-3 rounded-2xl bg-white p-4 shadow">
        {/* Video grid */}
        <section className="grid gap-3">
          <div className="text-sm font-semibold opacity-90">Group Call</div>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
            {/* Local */}
            <div className="rounded-xl border border-gray-200 p-2">
              <div className="mb-1 text-xs opacity-60">You</div>
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className={`aspect-video w-full rounded-lg bg-gray-100 ${camOn ? "" : "opacity-50"}`}
              />
            </div>

            {/* Remotes */}
            {remoteIds.map((id) => (
              <RemoteVideo key={id} peerId={id} streamsRef={remoteStreamsRef} />
            ))}
          </div>
        </section>

        {/* Messages */}
        <section className="overflow-y-auto">
          {messages.map((m, i) => (
            <div key={i} className="mb-2">
              {m.name === "system" ? (
                <div className="text-center text-xs opacity-60">— {m.text} —</div>
              ) : (
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="font-semibold">{m.name}</span>
                    <span className="text-xs opacity-60">{new Date(m.ts).toLocaleTimeString()}</span>
                  </div>
                  <div className="mt-1 rounded-xl bg-gray-100 px-3 py-2 text-slate-900">{m.text}</div>
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </section>

        {/* Composer */}
        <section className="grid grid-cols-[1fr_auto] gap-2 border-t border-gray-200 pt-3">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={nameCommitted ? "Type a message…" : "Join the lobby to chat…"}
            disabled={!nameCommitted}
            onKeyDown={(e) => nameCommitted && e.key === "Enter" && sendMessage()}
            className="rounded-xl border border-gray-300 bg-white px-3 py-3 outline-none disabled:cursor-not-allowed disabled:opacity-60"
          />
          <button
            onClick={sendMessage}
            disabled={!nameCommitted || !draft.trim()}
            className="rounded-xl bg-blue-600 px-4 py-3 font-bold text-white disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-slate-500"
          >
            Send
          </button>
        </section>
      </main>
    </div>
  );
}

/** Small component to render a remote video stream by peerId */
function RemoteVideo({ peerId, streamsRef }) {
  const vidRef = useRef(null);

  useEffect(() => {
    const stream = streamsRef.current.get(peerId) || null;
    if (vidRef.current && stream) {
      vidRef.current.srcObject = stream;
    }
  }, [peerId, streamsRef]);

  return (
    <div className="rounded-xl border border-gray-200 p-2">
      <div className="mb-1 text-xs opacity-60">Peer: {peerId.slice(0, 6)}…</div>
      <video ref={vidRef} autoPlay playsInline className="aspect-video w-full rounded-lg bg-gray-100" />
    </div>
  );
}