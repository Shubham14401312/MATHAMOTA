import { create } from "zustand";
import { loadCachedState, saveCachedState } from "../lib/cache.js";
import { mockChats, mockCurrentUser, mockMessages } from "../mockData.js";

const cached = loadCachedState();

function sortMessages(items) {
  return [...items].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
}

function persist(state) {
  saveCachedState({
    currentUser: state.currentUser,
    chatsList: state.chatsList,
    activeChatId: state.activeChatId,
    messagesByChat: state.messagesByChat
  });
}

export const useChatStore = create((set, get) => ({
  currentUser: cached?.currentUser || mockCurrentUser,
  chatsList: cached?.chatsList || mockChats,
  activeChatId: cached?.activeChatId || mockChats[0]?.id || null,
  messagesByChat: cached?.messagesByChat || mockMessages,
  socketState: "offline",
  socketSend: () => {},
  searchTerm: "",
  onlineOnly: false,
  error: "",
  sending: false,
  mobileChatOpen: false,
  installPromptEvent: null,
  typingByChat: {},
  initialize(payload) {
    const nextState = {
      currentUser: payload.currentUser,
      chatsList: payload.chatsList,
      activeChatId: payload.activeChatId || payload.chatsList[0]?.id || null,
      messagesByChat: payload.messagesByChat
    };
    set(nextState);
    persist({ ...get(), ...nextState });
  },
  setError(error) {
    set({ error });
  },
  setSending(sending) {
    set({ sending });
  },
  setSocketState(socketState) {
    set({ socketState });
  },
  setSocketSend(socketSend) {
    set({ socketSend });
  },
  setSearchTerm(searchTerm) {
    set({ searchTerm });
  },
  setOnlineOnly(onlineOnly) {
    set({ onlineOnly });
  },
  setInstallPromptEvent(installPromptEvent) {
    set({ installPromptEvent });
  },
  updateCurrentUser(patch) {
    const state = get();
    const nextCurrentUser = {
      ...state.currentUser,
      ...patch
    };
    set({ currentUser: nextCurrentUser });
    persist({ ...state, currentUser: nextCurrentUser });
  },
  createChat(name) {
    const state = get();
    const trimmedName = name.trim();
    if (!trimmedName) return null;

    const chatId = `chat-${trimmedName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`;
    const nextChat = {
      id: chatId,
      type: "direct",
      name: trimmedName,
      avatar: `https://api.dicebear.com/9.x/glass/svg?seed=${encodeURIComponent(trimmedName)}`,
      online: true,
      unreadCount: 0,
      lastMessage: "Start your conversation",
      lastMessageAt: new Date().toISOString(),
      participants: [state.currentUser.id, `user-${chatId}`]
    };
    const nextChats = [nextChat, ...state.chatsList];
    const nextMessages = {
      ...state.messagesByChat,
      [chatId]: []
    };
    const nextState = {
      chatsList: nextChats,
      activeChatId: chatId,
      messagesByChat: nextMessages,
      mobileChatOpen: true
    };
    set(nextState);
    persist({ ...state, ...nextState });
    return chatId;
  },
  selectChat(chatId) {
    const nextChats = get().chatsList.map((chat) =>
      chat.id === chatId ? { ...chat, unreadCount: 0 } : chat
    );
    const nextState = { activeChatId: chatId, chatsList: nextChats, mobileChatOpen: true };
    set(nextState);
    persist({ ...get(), ...nextState });
  },
  openSidebar() {
    set({ mobileChatOpen: false });
  },
  setTyping(chatId, name) {
    const state = get();
    const nextTyping = {
      ...state.typingByChat,
      [chatId]: name
    };
    set({ typingByChat: nextTyping });
  },
  clearTyping(chatId) {
    const state = get();
    const nextTyping = { ...state.typingByChat };
    delete nextTyping[chatId];
    set({ typingByChat: nextTyping });
  },
  appendMessage(message) {
    const state = get();
    const messages = state.messagesByChat[message.chatId] || [];
    if (messages.some((item) => item.id === message.id)) {
      return;
    }
    const nextMessages = {
      ...state.messagesByChat,
      [message.chatId]: sortMessages([...messages, message])
    };
    const nextChats = state.chatsList.map((chat) =>
      chat.id === message.chatId
        ? {
            ...chat,
            lastMessage: message.type === "text" ? message.text : message.type,
            lastMessageAt: message.timestamp,
            unreadCount:
              message.senderId !== state.currentUser.id ? (chat.unreadCount || 0) + 1 : chat.unreadCount || 0
          }
        : chat
    );
    set({ messagesByChat: nextMessages, chatsList: nextChats });
    persist({ ...state, messagesByChat: nextMessages, chatsList: nextChats });
  },
  simulateReceiptLifecycle(chatId, messageId) {
    setTimeout(() => get().updateMessageStatus(chatId, messageId, "delivered"), 1200);
    setTimeout(() => get().updateMessageStatus(chatId, messageId, "read"), 3200);
  },
  updateMessageStatus(chatId, messageId, status) {
    const state = get();
    const nextMessages = {
      ...state.messagesByChat,
      [chatId]: (state.messagesByChat[chatId] || []).map((item) =>
        item.id === messageId ? { ...item, status } : item
      )
    };
    set({ messagesByChat: nextMessages });
    persist({ ...state, messagesByChat: nextMessages });
  }
}));
