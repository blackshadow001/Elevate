"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User, mockUsers } from "@/data/users";

interface AuthResult { success: boolean; user?: User; error?: string; }
interface AuthContextType {
  user: User;
  isAuthenticated: boolean;
  isReady: boolean;
  login: (email: string, password: string) => Promise<AuthResult>;
  signup: (name: string, email: string, password: string) => Promise<AuthResult>;
  logout: () => Promise<boolean>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
type ApiUser = { id: string; name: string; email: string; role: User["role"]; avatar: string | null };
function toUser(user: ApiUser): User {
  return { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar || "" };
}
function errorMessage(body: unknown, fallback: string) {
  if (body && typeof body === "object" && "error" in body) {
    const error = body.error as { message?: string };
    if (typeof error?.message === "string") return error.message;
  }
  return fallback;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [sessionUser, setSessionUser] = useState<User | null>(null);
  const [isReady, setIsReady] = useState(false);
  const sessionUserId = sessionUser?.id;

  const refresh = async () => {
    try {
      const response = await fetch("/api/auth/me", { credentials: "same-origin", cache: "no-store" });
      const body = await response.json();
      setSessionUser(response.ok && body.data ? toUser(body.data as ApiUser) : null);
    } catch {
      setSessionUser(null);
    } finally {
      setIsReady(true);
    }
  };

  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/me", { credentials: "same-origin", cache: "no-store" })
      .then(async (response) => ({ ok: response.ok, body: await response.json() }))
      .then(({ ok, body }) => { if (!cancelled) setSessionUser(ok && body.data ? toUser(body.data as ApiUser) : null); })
      .catch(() => { if (!cancelled) setSessionUser(null); })
      .finally(() => { if (!cancelled) setIsReady(true); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!sessionUserId) return;
    let cancelled = false;
    const recheck = async () => {
      try {
        const response = await fetch("/api/auth/me", { credentials: "same-origin", cache: "no-store" });
        if (cancelled) return;
        if (response.status === 401) {
          setSessionUser(null);
          return;
        }
        if (response.ok) {
          const body = await response.json();
          if (!cancelled && body.data) setSessionUser(toUser(body.data as ApiUser));
        }
      } catch { /* Keep the visible account during a transient network failure. */ }
    };
    const onFocus = () => { void recheck(); };
    const onVisibility = () => { if (document.visibilityState === "visible") void recheck(); };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);
    const timer = window.setInterval(() => { if (document.visibilityState === "visible") void recheck(); }, 15000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [sessionUserId]);

  const authenticate = async (path: string, payload: Record<string, string>): Promise<AuthResult> => {
    try {
      const response = await fetch(path, {
        method: "POST", headers: { "Content-Type": "application/json" }, credentials: "same-origin", body: JSON.stringify(payload),
      });
      const body = await response.json();
      if (!response.ok || !body.data) return { success: false, error: errorMessage(body, "Authentication failed. Please try again.") };
      const user = toUser(body.data as ApiUser);
      setSessionUser(user);
      setIsReady(true);
      return { success: true, user };
    } catch {
      return { success: false, error: "Unable to connect. Check your connection and try again." };
    }
  };

  const login = (email: string, password: string) => authenticate("/api/auth/login", { email, password });
  const signup = (name: string, email: string, password: string) => authenticate("/api/auth/register", { name, email, password });
  const logout = async () => {
    try {
      const response = await fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" });
      if (!response.ok) return false;
      setSessionUser(null);
      return true;
    } catch { return false; }
  };

  return (
    <AuthContext.Provider value={{ user: sessionUser || mockUsers[0], isAuthenticated: Boolean(sessionUser), isReady, login, signup, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
