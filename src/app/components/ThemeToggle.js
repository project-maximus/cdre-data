"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

function SunIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" /><path d="M12 20v2" />
      <path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" /><path d="M20 12h2" />
      <path d="m6.34 17.66-1.41 1.41" /><path d="m19.07 4.93-1.41 1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export default function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="theme-toggle-placeholder" style={{ width: 32, height: 32 }} />;
  }

  const isDark = resolvedTheme === "dark";

  return (
    <div className="theme-toggle" style={{ position: "relative" }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="btn btn-ghost btn-icon btn-sm"
        aria-label="Toggle theme"
        title="Toggle theme"
      >
        {isDark ? <MoonIcon /> : <SunIcon />}
      </button>

      {isOpen && (
        <>
          <div 
            style={{ position: "fixed", inset: 0, zIndex: 40 }} 
            onClick={() => setIsOpen(false)} 
          />
          <div 
            className="theme-menu animate-fadeInUp"
            style={{
              position: "absolute",
              bottom: "100%",
              left: 0,
              marginBottom: 8,
              background: "var(--bg-raised)",
              border: "1px solid var(--border-default)",
              borderRadius: "var(--radius-md)",
              padding: 4,
              minWidth: 140,
              boxShadow: "var(--shadow-lg)",
              zIndex: 50,
              display: "flex",
              flexDirection: "column",
              gap: 2
            }}
          >
            <button 
              className={`theme-menu-item ${theme === "light" ? "active" : ""}`}
              onClick={() => { setTheme("light"); setIsOpen(false); }}
            >
              <SunIcon /> Light 
              {theme === "light" && <span style={{ marginLeft: "auto", color: "var(--accent-500)" }}><CheckIcon /></span>}
            </button>
            <button 
              className={`theme-menu-item ${theme === "dark" ? "active" : ""}`}
              onClick={() => { setTheme("dark"); setIsOpen(false); }}
            >
              <MoonIcon /> Dark
              {theme === "dark" && <span style={{ marginLeft: "auto", color: "var(--accent-500)" }}><CheckIcon /></span>}
            </button>
            <button 
              className={`theme-menu-item ${theme === "system" ? "active" : ""}`}
              onClick={() => { setTheme("system"); setIsOpen(false); }}
            >
              <div style={{ width: 14, height: 14, borderRadius: "50%", background: "linear-gradient(135deg, var(--bg-base) 50%, var(--bg-inverse) 50%)", border: "1px solid var(--border-strong)" }} />
              System
              {theme === "system" && <span style={{ marginLeft: "auto", color: "var(--accent-500)" }}><CheckIcon /></span>}
            </button>
          </div>
        </>
      )}
      <style>{`
        .theme-menu-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          border: none;
          background: none;
          color: var(--text-secondary);
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          border-radius: var(--radius-sm);
          text-align: left;
          width: 100%;
        }
        .theme-menu-item:hover {
          background: var(--bg-hover);
          color: var(--text-primary);
        }
        .theme-menu-item.active {
          color: var(--text-primary);
        }
      `}</style>
    </div>
  );
}
