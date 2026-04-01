import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const API = import.meta.env.VITE_API_URL || window.location.origin;
const wallpapers = ["aurora", "sunset", "mint", "midnight"];
const stickers = ["<3", ":)", ":*", "(love)", "(moon)", "(music)", "(flower)", "(hug)"];

function renderAttachment(item) {
  const name = item.attachmentName?.toLowerCase() || "";
  if (/\.(png|jpg|jpeg|gif|webp)$/i.test(name)) {
    return <img src={item.attachmentUrl} alt={item.attachmentName} className="media-preview" />;
  }
  if (/\.(mp4|webm|mov)$/i.test(name)) {
    return <video src={item.attachmentUrl} className="media-preview" controls />;
  }
  if (/\.(mp3|wav|m4a|ogg)$/i.test(name)) {
    return <audio src={item.attachmentUrl} controls />;
  }
  return (
    <a href={item.attachmentUrl} target="_blank" rel="noreferrer">
      {item.attachmentName || "Open file"}
    </a>
  );
}

function api(path, options = {}) {
  return fetch(`${API}${path}`, {
    headers: {
      ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {})
    },
    ...options
  }).then((r) => r.json());
}

function Message({ item, currentUser }) {
  const mine = item.senderId === currentUser?.id;
  return (
    <div className={`bubble ${mine ? "mine" : ""}`}>
      <span>{item.body}</span>
      {item.attachmentUrl ? renderAttachment(item) : null}
    </div>
  );
}

function GamePanel({ socket, chatId }) {
  const [tic, setTic] = useState({ board: Array(9).fill(null), next: "X" });
  const [ludo, setLudo] = useState({ positions: { red: 0, blue: 0 }, turn: "red", dice: 1 });

  useEffect(() => {
    if (!socket) return;
    const onTic = (payload) => setTic(payload);
    const onLudo = (payload) => setLudo(payload);
    socket.on("game:tic", onTic);
    socket.on("game:ludo", onLudo);
    return () => {
      socket.off("game:tic", onTic);
      socket.off("game:ludo", onLudo);
    };
  }, [socket]);

  return (
    <aside className="games">
      <h3>Play Together</h3>
      <div className="game-card">
        <strong>Tic-Tac-Toe</strong>
        <div className="grid">
          {tic.board.map((cell, index) => (
            <button key={index} onClick={() => socket?.emit("game:tic", { chatId, index })}>
              {cell}
            </button>
          ))}
        </div>
        <small>{tic.winner ? `${tic.winner} wins` : `Next: ${tic.next}`}</small>
      </div>
      <div className="game-card">
        <strong>Mini Ludo</strong>
        <div className="ludo-track">
          <span>Red: {ludo.positions.red}/20</span>
          <span>Blue: {ludo.positions.blue}/20</span>
        </div>
        <button onClick={() => socket?.emit("game:ludo", { chatId })}>
          Roll ({ludo.turn})
        </button>
        <small>{ludo.winner ? `${ludo.winner} wins` : `Last dice: ${ludo.dice}`}</small>
      </div>
    </aside>
  );
}

export default function App() {
  const [session, setSession] = useState(() => {
    const stored = localStorage.getItem("mathamota-session");
    return stored ? JSON.parse(stored) : null;
  });
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [typing, setTyping] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [name, setName] = useState("");
  const [title, setTitle] = useState("Us only");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminData, setAdminData] = useState(null);
  const [wallpaper, setWallpaper] = useState("aurora");
  const [galleryVisible, setGalleryVisible] = useState(true);
  const [installPrompt, setInstallPrompt] = useState(null);
  const socketRef = useRef(null);

  useEffect(() => {
    const onBeforeInstall = (event) => {
      event.preventDefault();
      setInstallPrompt(event);
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstall);
  }, []);

  useEffect(() => {
    if (!session?.token || !session?.chat?.id) return;
    localStorage.setItem("mathamota-session", JSON.stringify(session));
    const socket = io(API, { auth: { token: session.token } });
    socketRef.current = socket;
    socket.emit("room:join", { chatId: session.chat.id });
    socket.on("room:snapshot", ({ messages: incoming }) => setMessages(incoming));
    socket.on("message:new", (incoming) => setMessages((prev) => [...prev, incoming]));
    socket.on("typing", ({ name: senderName }) => setTyping(`${senderName} is typing...`));
    return () => socket.disconnect();
  }, [session]);

  const startChat = async () => {
    const data = await api("/auth/start", {
      method: "POST",
      body: JSON.stringify({ name, title })
    });
    if (!data.error) {
      setInviteCode(data.inviteCode);
      setSession(data);
    }
  };

  const joinChat = async () => {
    const data = await api("/auth/join", {
      method: "POST",
      body: JSON.stringify({ name, inviteCode })
    });
    if (!data.error) setSession(data);
  };

  const sendMessage = () => {
    if (!draft.trim()) return;
    socketRef.current?.emit("message:send", {
      chatId: session.chat.id,
      body: draft
    });
    setDraft("");
  };

  const onFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const form = new FormData();
    form.append("file", file);
    const uploaded = await api(`/chat/${session.chat.id}/upload`, {
      method: "POST",
      token: session.token,
      body: form
    });
    if (!uploaded.error) setMessages((prev) => [...prev, uploaded]);
  };

  const savePrefs = async (nextWallpaper, nextGalleryVisible) => {
    setWallpaper(nextWallpaper);
    setGalleryVisible(nextGalleryVisible);
    await api(`/chat/${session.chat.id}/preferences`, {
      method: "POST",
      token: session.token,
      body: JSON.stringify({
        wallpaper: nextWallpaper,
        galleryVisible: nextGalleryVisible
      })
    });
  };

  const adminLogin = async () => {
    const auth = await api("/auth/admin", {
      method: "POST",
      body: JSON.stringify({ email: adminEmail, password: adminPassword })
    });
    if (auth.token) {
      const overview = await api("/admin/overview", { token: auth.token });
      setAdminData(overview);
    }
  };

  if (!session) {
    return (
      <main className="shell landing aurora">
        <section className="hero">
          <div>
            <p className="eyebrow">MATHAMOTA</p>
            <h1>Private chat space for two.</h1>
            <p className="sub">
              Minimal private messaging for two people, with live chat, shared media, install support, and owner-only admin access.
            </p>
            {installPrompt ? (
              <button
                onClick={async () => {
                  await installPrompt.prompt();
                  setInstallPrompt(null);
                }}
              >
                Install app
              </button>
            ) : null}
          </div>
          <div className="card stack">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Private room title" />
            <div className="row">
              <button onClick={startChat}>Create room</button>
              <button className="ghost" onClick={joinChat}>Join room</button>
            </div>
            <input
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              placeholder="Invite code for partner"
            />
            <p className="tip">No OTP. Share the invite code only with the person you trust.</p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className={`shell app ${wallpaper}`}>
      <section className="sidebar">
        <div className="brand">
          <p className="eyebrow">Room code</p>
          <strong>{session.inviteCode || inviteCode || "Shared already"}</strong>
        </div>
        <div className="card stack">
          <h3>Wallpapers</h3>
          <div className="chips">
            {wallpapers.map((item) => (
              <button
                key={item}
                className={item === wallpaper ? "active" : ""}
                onClick={() => savePrefs(item, galleryVisible)}
              >
                {item}
              </button>
            ))}
          </div>
          <label className="toggle">
            <input
              type="checkbox"
              checked={galleryVisible}
              onChange={(e) => savePrefs(wallpaper, e.target.checked)}
            />
            <span>Show shared media in gallery</span>
          </label>
        </div>
        <GamePanel socket={socketRef.current} chatId={session.chat.id} />
        <div className="card stack">
          <h3>Admin panel</h3>
          <input value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} placeholder="Admin email" />
          <input
            value={adminPassword}
            onChange={(e) => setAdminPassword(e.target.value)}
            type="password"
            placeholder="Admin password"
          />
          <button onClick={adminLogin}>Open admin panel</button>
          {adminData ? (
            <div className="admin-box">
              <p>Users: {adminData.users}</p>
              <p>Chats: {adminData.chats}</p>
              <p>Messages: {adminData.messages}</p>
              <div className="audit-list">
                {adminData.recentMessages.map((item, index) => (
                  <p key={index}>
                    <strong>{item.sender}:</strong> {item.body || item.kind}
                  </p>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </section>

      <section className="chat-panel">
        <header className="chat-top">
          <div>
            <p className="eyebrow">Private chat</p>
            <h2>{session.chat.title || "Us only"}</h2>
          </div>
          <div className="actions">
            <label className="file-button">
              <input type="file" accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.zip" onChange={onFile} />
              Share media or file
            </label>
          </div>
        </header>

        <div className="messages">
          {messages.map((item) => (
            <Message key={item.id} item={item} currentUser={session.user} />
          ))}
          {typing ? <p className="typing">{typing}</p> : null}
        </div>

        <div className="composer">
          <div className="stickers">
            {stickers.map((item) => (
              <button key={item} onClick={() => setDraft((prev) => prev + item)}>
                {item}
              </button>
            ))}
          </div>
          <div className="row">
            <textarea
              value={draft}
              onChange={(e) => {
                setDraft(e.target.value);
                socketRef.current?.emit("typing", {
                  chatId: session.chat.id,
                  name: session.user.name
                });
              }}
            placeholder="Write a message..."
            />
            <button onClick={sendMessage}>Send</button>
          </div>
        </div>
      </section>
    </main>
  );
}
