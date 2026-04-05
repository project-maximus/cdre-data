"use client";

import { useState, useRef, useCallback, createContext, useContext } from "react";

const ToastContext = createContext(null);

let toastIdCounter = 0;

function CheckIcon() {
  return (
    <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M2.5 6.5L5 9L9.5 3.5" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M6 3.5V6.5" />
      <circle cx="6" cy="8.5" r="0.5" fill="currentColor" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M6 5.5V8.5" />
      <circle cx="6" cy="3.5" r="0.5" fill="currentColor" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M3.5 3.5L10.5 10.5M10.5 3.5L3.5 10.5" />
    </svg>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const dismissRef = useRef(null);

  const dismissToast = useCallback((id) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, exiting: true } : t))
    );
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 260);
  }, []);

  dismissRef.current = dismissToast;

  const addToast = useCallback((message, type = "info", duration = 4000) => {
    const id = ++toastIdCounter;
    setToasts((prev) => [...prev, { id, message, type, exiting: false }]);

    if (duration > 0) {
      setTimeout(() => dismissRef.current(id), duration);
    }

    return id;
  }, []);

  const toastApi = {
    success: (msg) => addToast(msg, "success"),
    error: (msg) => addToast(msg, "error", 6000),
    info: (msg) => addToast(msg, "info"),
  };

  const iconMap = {
    success: <CheckIcon />,
    error: <AlertIcon />,
    info: <InfoIcon />,
  };

  return (
    <ToastContext.Provider value={toastApi}>
      {children}
      <div className="toast-container">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`toast-item toast-${t.type} ${t.exiting ? "exiting" : ""}`}
          >
            <span className="toast-indicator">
              {iconMap[t.type]}
            </span>
            <span>{t.message}</span>
            <button
              className="toast-close"
              onClick={() => dismissToast(t.id)}
              aria-label="Dismiss"
            >
              <CloseIcon />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
