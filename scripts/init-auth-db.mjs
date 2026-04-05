import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { neon } from "@neondatabase/serverless";

function loadEnvFromFile() {
  const envPath = path.resolve(process.cwd(), ".env");

  if (!fs.existsSync(envPath)) {
    return;
  }

  const envLines = fs.readFileSync(envPath, "utf-8").split("\n");

  for (const line of envLines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");
    const key = trimmed.slice(0, separatorIndex).trim();
    const rawValue = trimmed.slice(separatorIndex + 1).trim();

    if (!process.env[key]) {
      process.env[key] = rawValue;
    }
  }
}

function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
  const hash = crypto
    .scryptSync(password, salt, 64, { N: 16384, r: 8, p: 1 })
    .toString("hex");

  return { hash, salt };
}

async function main() {
  loadEnvFromFile();

  const connectionString = process.env.NEON_DB;
  if (!connectionString) {
    throw new Error("NEON_DB is missing. Add it to .env and retry.");
  }

  const sql = neon(connectionString);

  await sql`
    CREATE TABLE IF NOT EXISTS auth_users (
      id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      password_salt TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  const dummyUsers = [
    { username: "admin", password: "admin123" },
    { username: "editor", password: "editor123" },
    { username: "viewer", password: "viewer123" },
  ];

  for (const entry of dummyUsers) {
    const { hash, salt } = hashPassword(entry.password);

    await sql`
      INSERT INTO auth_users (username, password_hash, password_salt)
      VALUES (${entry.username}, ${hash}, ${salt})
      ON CONFLICT (username)
      DO UPDATE
      SET password_hash = EXCLUDED.password_hash,
          password_salt = EXCLUDED.password_salt
    `;
  }

  console.log("auth_users table is ready and dummy users are seeded.");
  console.log("Dummy users: admin/admin123, editor/editor123, viewer/viewer123");
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
