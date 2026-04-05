import { neon } from "@neondatabase/serverless";

export function getSql() {
  const connectionString = process.env.NEON_DB;

  if (!connectionString) {
    throw new Error("Missing NEON_DB environment variable.");
  }

  return neon(connectionString);
}
