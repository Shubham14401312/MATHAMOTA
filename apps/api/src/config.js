import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const storageDir = path.join(rootDir, "storage");

export const config = {
  port: Number(process.env.PORT || 8080),
  clientOrigin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
  jwtSecret: process.env.JWT_SECRET || "dev-insecure-secret",
  adminEmail: process.env.ADMIN_EMAIL || "owner@mathamota.app",
  adminPassword: process.env.ADMIN_PASSWORD || "",
  adminPasswordHash: process.env.ADMIN_PASSWORD_HASH || "",
  uploadMaxBytes: Number(process.env.UPLOAD_MAX_MB || 100) * 1024 * 1024,
  publicAppUrl: process.env.PUBLIC_APP_URL || "http://localhost:5173",
  storageDir,
  uploadDir: path.join(storageDir, "uploads"),
  dbPath: path.join(storageDir, "db.sqlite")
};
