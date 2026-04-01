import fs from "node:fs";
import crypto from "node:crypto";
import Database from "better-sqlite3";
import { v4 as uuid } from "uuid";
import { config } from "./config.js";

fs.mkdirSync(config.uploadDir, { recursive: true });

const db = new Database(config.dbPath);
db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    invite_code TEXT UNIQUE NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS chats (
    id TEXT PRIMARY KEY,
    owner_id TEXT NOT NULL,
    partner_id TEXT,
    title TEXT NOT NULL,
    wallpaper TEXT DEFAULT 'aurora',
    gallery_visible INTEGER DEFAULT 1,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    chat_id TEXT NOT NULL,
    sender_id TEXT NOT NULL,
    kind TEXT NOT NULL,
    body TEXT,
    attachment_url TEXT,
    attachment_name TEXT,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS admin_audit (
    id TEXT PRIMARY KEY,
    action TEXT NOT NULL,
    detail TEXT,
    created_at TEXT NOT NULL
  );
`);

function now() {
  return new Date().toISOString();
}

function cryptoInvite() {
  return crypto.randomBytes(4).toString("hex").toUpperCase();
}

export function createUser(name) {
  const user = {
    id: uuid(),
    name,
    inviteCode: cryptoInvite(),
    createdAt: now()
  };
  db.prepare(
    `INSERT INTO users (id, name, invite_code, created_at) VALUES (@id, @name, @inviteCode, @createdAt)`
  ).run(user);
  return user;
}

export function createChat({ ownerId, title }) {
  const chat = {
    id: uuid(),
    ownerId,
    title,
    createdAt: now()
  };
  db.prepare(
    `INSERT INTO chats (id, owner_id, title, created_at) VALUES (@id, @ownerId, @title, @createdAt)`
  ).run(chat);
  return chat;
}

export function joinChatByInvite({ inviteCode, partnerId }) {
  const owner = db.prepare(`SELECT * FROM users WHERE invite_code = ?`).get(inviteCode);
  if (!owner) return null;
  const chat = db.prepare(`SELECT * FROM chats WHERE owner_id = ?`).get(owner.id);
  if (!chat) return null;
  db.prepare(`UPDATE chats SET partner_id = ? WHERE id = ?`).run(partnerId, chat.id);
  return db.prepare(`SELECT * FROM chats WHERE id = ?`).get(chat.id);
}

export function getChat(chatId) {
  return db.prepare(`SELECT * FROM chats WHERE id = ?`).get(chatId);
}

export function getUserById(id) {
  return db.prepare(`SELECT * FROM users WHERE id = ?`).get(id);
}

export function getMessages(chatId) {
  return db
    .prepare(
      `SELECT id, chat_id as chatId, sender_id as senderId, kind, body, attachment_url as attachmentUrl, attachment_name as attachmentName, created_at as createdAt
       FROM messages WHERE chat_id = ? ORDER BY created_at ASC`
    )
    .all(chatId);
}

export function insertMessage(message) {
  const payload = {
    id: uuid(),
    createdAt: now(),
    ...message
  };
  db.prepare(
    `INSERT INTO messages (id, chat_id, sender_id, kind, body, attachment_url, attachment_name, created_at)
     VALUES (@id, @chatId, @senderId, @kind, @body, @attachmentUrl, @attachmentName, @createdAt)`
  ).run(payload);
  return payload;
}

export function updateChatPrefs(chatId, prefs) {
  db.prepare(
    `UPDATE chats
     SET wallpaper = COALESCE(@wallpaper, wallpaper),
         gallery_visible = COALESCE(@galleryVisible, gallery_visible)
     WHERE id = @chatId`
  ).run({
    chatId,
    wallpaper: prefs.wallpaper ?? null,
    galleryVisible:
      typeof prefs.galleryVisible === "boolean" ? Number(prefs.galleryVisible) : null
  });
  return getChat(chatId);
}

export function getAdminOverview() {
  const users = db.prepare(`SELECT COUNT(*) as count FROM users`).get().count;
  const chats = db.prepare(`SELECT COUNT(*) as count FROM chats`).get().count;
  const messages = db.prepare(`SELECT COUNT(*) as count FROM messages`).get().count;
  const recentMessages = db
    .prepare(
      `SELECT m.body, m.kind, m.created_at as createdAt, u.name as sender
       FROM messages m
       JOIN users u ON u.id = m.sender_id
       ORDER BY m.created_at DESC LIMIT 10`
    )
    .all();
  return { users, chats, messages, recentMessages };
}

export function writeAdminAudit(action, detail) {
  db.prepare(
    `INSERT INTO admin_audit (id, action, detail, created_at) VALUES (?, ?, ?, ?)`
  ).run(uuid(), action, detail, now());
}
