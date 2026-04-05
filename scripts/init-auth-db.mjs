import crypto from "node:crypto";
import { neon } from "@neondatabase/serverless";
import { loadEnvFromFile } from "./env.mjs";

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
      role TEXT NOT NULL DEFAULT 'teacher' CHECK (role IN ('admin', 'teacher', 'developer')),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  /* Add role column to existing tables that lack it */
  await sql`
    ALTER TABLE auth_users
    ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'teacher'
  `;

  await sql`
    ALTER TABLE auth_users
    DROP CONSTRAINT IF EXISTS auth_users_role_check
  `;

  await sql`
    ALTER TABLE auth_users
    ADD CONSTRAINT auth_users_role_check
    CHECK (role IN ('admin', 'teacher', 'developer'))
  `;

  const users = [
    { username: "admin", password: "A9v!Q2m#L8r@Z5xT", role: "admin" },
    { username: "developer", password: "D4k$N7p!R2t@W9yF", role: "developer" },
    { username: "sylvia", password: "S7!mK2@vQ9#tL4xN", role: "teacher" },
    { username: "kristine", password: "K5@rP8!zM3#nT6wQ", role: "teacher" },
    { username: "berin", password: "B8#uL3@qV6!sN2xR", role: "teacher" },
  ];

  for (const entry of users) {
    const { hash, salt } = hashPassword(entry.password);

    await sql`
      INSERT INTO auth_users (username, password_hash, password_salt, role)
      VALUES (${entry.username}, ${hash}, ${salt}, ${entry.role})
      ON CONFLICT (username)
      DO UPDATE
      SET password_hash = EXCLUDED.password_hash,
          password_salt = EXCLUDED.password_salt,
          role = EXCLUDED.role
    `;
  }

  /* Remove old users that are no longer needed */
  await sql`
    DELETE FROM auth_users
    WHERE username NOT IN ('admin', 'developer', 'sylvia', 'kristine', 'berin')
  `;

  console.log("auth_users table is ready with roles.");
  console.log("Users updated: admin (admin), developer (developer), sylvia (teacher), kristine (teacher), berin (teacher)");
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
