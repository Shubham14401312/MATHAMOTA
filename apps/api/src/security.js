import crypto from "node:crypto";

export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password, stored) {
  const [salt, originalHash] = stored.split(":");
  if (!salt || !originalHash) return false;
  const candidateHash = crypto.scryptSync(password, salt, 64).toString("hex");
  return crypto.timingSafeEqual(
    Buffer.from(originalHash, "hex"),
    Buffer.from(candidateHash, "hex")
  );
}

if (process.argv[1] && process.argv[1].endsWith("security.js")) {
  const provided = process.env.ADMIN_PASSWORD;
  if (!provided) {
    console.log("Set ADMIN_PASSWORD in your shell, then run `node apps/api/src/security.js`.");
  } else {
    console.log(hashPassword(provided));
  }
}

