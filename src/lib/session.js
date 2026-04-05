export function getSessionUser(request) {
  return request.cookies.get("session_user")?.value || "";
}

export function requireSessionUser(request) {
  const username = getSessionUser(request);

  if (!username) {
    return { ok: false, username: "" };
  }

  return { ok: true, username };
}
