export function getSessionUser(request) {
  const raw = request.cookies.get("session_user")?.value || "";

  if (!raw) {
    return { username: "", role: "" };
  }

  try {
    const parsed = JSON.parse(raw);
    return {
      username: parsed.username || "",
      role: parsed.role || "",
    };
  } catch {
    /* Legacy plain-text cookie fallback */
    return { username: raw, role: "" };
  }
}

export function requireSessionUser(request) {
  const session = getSessionUser(request);

  if (!session.username) {
    return { ok: false, username: "", role: "" };
  }

  return { ok: true, username: session.username, role: session.role };
}

export function requireRole(request, allowedRoles) {
  const session = requireSessionUser(request);

  if (!session.ok) {
    return { ok: false, username: "", role: "", reason: "unauthenticated" };
  }

  if (!allowedRoles.includes(session.role)) {
    return { ok: false, username: session.username, role: session.role, reason: "forbidden" };
  }

  return { ok: true, username: session.username, role: session.role };
}
