import { io } from "socket.io-client";

const WS_BASE = import.meta.env.VITE_WS_URL || window.location.origin;

export function connectSocket({ userId, onStatus, onEvent }) {
  if (!WS_BASE) {
    onStatus("offline");
    return { close() {}, send() {} };
  }

  const socket = io(WS_BASE, {
    transports: ["websocket"],
    query: {
      userId
    }
  });

  socket.on("connect", () => onStatus("connected"));
  socket.on("disconnect", () => onStatus("disconnected"));
  socket.on("connect_error", () => onStatus("error"));

  socket.on("message:new", (message) => {
    onEvent({
      type: "message:new",
      message: {
        id: message.id,
        chatId: message.chatId,
        senderId: message.senderId,
        receiverId: message.receiverId,
        type: message.kind || "text",
        text: message.body || "",
        media: message.attachmentUrl
          ? {
              url: message.attachmentUrl,
              name: message.attachmentName || message.kind
            }
          : null,
        document: message.attachmentName || null,
        status: "delivered",
        timestamp: message.createdAt
      }
    });
  });

  socket.on("typing", (payload) => {
    onEvent({ type: "typing", ...payload });
  });

  return {
    close() {
      socket.close();
    },
    send(payload) {
      if (!payload?.type) return;
      if (payload.type === "typing") {
        socket.emit("typing", {
          chatId: payload.chatId,
          name: payload.name
        });
      }
      if (payload.type === "room:join") {
        socket.emit("room:join", {
          chatId: payload.chatId
        });
      }
      if (payload.type === "message:send") {
        socket.emit("message:send", payload);
      }
    }
  };
}
