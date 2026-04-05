"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const ROLE_HOME = {
  admin: "/admin",
  teacher: "/dashboard",
  developer: "/dashboard",
};

function LogoIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L2 7l10 5 10-5-10-5z" />
      <path d="M2 17l10 5 10-5" />
      <path d="M2 12l10 5 10-5" />
    </svg>
  );
}

export default function Home() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Sign in failed.");
        return;
      }

      const destination = ROLE_HOME[data.role] || "/dashboard";
      router.push(destination);
      router.refresh();
    } catch {
      setError("Could not reach server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page">
      {/* Left Hero Panel */}
      <div className="login-hero">
        <div className="login-hero-bg" />
        <div className="login-hero-grid" />
        <div className="login-hero-content">
          <div className="login-hero-badge">
            <span className="dot" />
            Content Management Platform
          </div>
          <h2>
            Build your CDRE
            <br />
            prep library with
            <br />
            your team.
          </h2>
          <p>
            Organize study materials, track submissions, and collaborate
            on exam preparation content — all in one place.
          </p>

          <div style={{ marginTop: 40, display: "flex", gap: 32 }}>
            <div>
              <div style={{ fontSize: 28, fontWeight: 700, color: "white", letterSpacing: "-0.03em" }}>10</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>Sections</div>
            </div>
            <div>
              <div style={{ fontSize: 28, fontWeight: 700, color: "white", letterSpacing: "-0.03em" }}>80+</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>Topics</div>
            </div>
            <div>
              <div style={{ fontSize: 28, fontWeight: 700, color: "white", letterSpacing: "-0.03em" }}>7</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>Resource Types</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="login-form-panel">
        <div className="login-form-wrapper">
          <div className="login-logo">
            <LogoIcon />
          </div>

          <h1 className="login-title">Welcome back</h1>
          <p className="login-subtitle">
            Sign in to manage your CDRE prep content.
          </p>

          <form onSubmit={handleSubmit} className="login-form">
            <div>
              <label htmlFor="username" className="label">Username</label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input"
                placeholder="Enter your username"
                required
                autoComplete="username"
              />
            </div>

            <div>
              <label htmlFor="password" className="label">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                placeholder="Enter your password"
                required
                autoComplete="current-password"
              />
            </div>

            {error && <div className="login-error">{error}</div>}

            <button type="submit" disabled={loading} className="login-btn">
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
