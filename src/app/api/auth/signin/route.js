import { NextResponse } from "next/server";
import { getSql } from "@/lib/db";
import { verifyPassword } from "@/lib/auth";

export async function POST(request) {
  try {
    const sql = getSql();
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required." },
        { status: 400 }
      );
    }

    const users = await sql`
      SELECT username, password_hash, password_salt
      FROM auth_users
      WHERE username = ${username}
      LIMIT 1
    `;

    if (!users.length) {
      return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
    }

    const user = users[0];
    const isValid = verifyPassword(password, user.password_hash, user.password_salt);

    if (!isValid) {
      return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
    }

    const response = NextResponse.json({ success: true, username: user.username });

    response.cookies.set("session_user", user.username, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 8,
    });

    return response;
  } catch {
    return NextResponse.json(
      { error: "Unable to sign in right now." },
      { status: 500 }
    );
  }
}
