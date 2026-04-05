import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AdminClient from "./admin-client";

export default async function AdminPage() {
  const cookieStore = await cookies();
  const raw = cookieStore.get("session_user")?.value;

  if (!raw) {
    redirect("/");
  }

  let username = "";
  let role = "";

  try {
    const parsed = JSON.parse(raw);
    username = parsed.username || "";
    role = parsed.role || "";
  } catch {
    username = raw;
    role = "";
  }

  if (role !== "admin" && role !== "developer") {
    redirect("/dashboard");
  }

  return <AdminClient username={username} role={role} />;
}
