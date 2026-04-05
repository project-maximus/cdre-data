import { NextResponse } from "next/server";

const ROLE_ACCESS = {
  admin: ["/admin"],
  teacher: ["/dashboard"],
  developer: ["/admin", "/dashboard"],
};

const ROLE_HOME = {
  admin: "/admin",
  teacher: "/dashboard",
  developer: "/dashboard",
};

function getSession(request) {
  const raw = request.cookies.get("session_user")?.value || "";
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    if (parsed.username && parsed.role) return parsed;
    return null;
  } catch {
    return null;
  }
}

export function proxy(request) {
  const { pathname } = request.nextUrl;
  const session = getSession(request);

  /* Redirect logged-in users away from login page */
  if (pathname === "/") {
    if (session) {
      const home = ROLE_HOME[session.role] || "/dashboard";
      return NextResponse.redirect(new URL(home, request.url));
    }
    return NextResponse.next();
  }

  /* Protect /dashboard routes */
  if (pathname.startsWith("/dashboard")) {
    if (!session) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    const allowed = ROLE_ACCESS[session.role] || [];
    if (!allowed.includes("/dashboard")) {
      const home = ROLE_HOME[session.role] || "/";
      return NextResponse.redirect(new URL(home, request.url));
    }
    return NextResponse.next();
  }

  /* Protect /admin routes */
  if (pathname.startsWith("/admin")) {
    if (!session) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    const allowed = ROLE_ACCESS[session.role] || [];
    if (!allowed.includes("/admin")) {
      const home = ROLE_HOME[session.role] || "/";
      return NextResponse.redirect(new URL(home, request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/dashboard/:path*", "/admin/:path*"],
};
