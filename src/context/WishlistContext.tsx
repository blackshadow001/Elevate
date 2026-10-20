"use client";

import React, { createContext, useContext, useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { useNotification } from "@/components/notifications/NotificationProvider";
import { useAuth } from "@/context/AuthContext";

interface WishlistContextType {
  wishlistIds: string[];
  isWishlisted: (courseId: string) => boolean;
  toggleWishlist: (courseId: string, courseTitle?: string, desiredSaved?: boolean) => Promise<boolean>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);
const EMPTY: string[] = [];
let ids: string[] = EMPTY;
let activeUserId = "";
let revision = 0;
const listeners = new Set<() => void>();
function emit(next: string[]) { ids = next; listeners.forEach((listener) => listener()); }
function subscribe(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; }
function snapshot() { return ids; }
function serverSnapshot() { return EMPTY; }

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const wishlistIds = useSyncExternalStore(subscribe, snapshot, serverSnapshot);
  const { user, isAuthenticated, isReady } = useAuth();
  const { notify } = useNotification();
  const router = useRouter();

  useEffect(() => {
    if (!isReady) return;
    const nextUserId = isAuthenticated ? user.id : "";
    if (nextUserId === activeUserId) return;
    activeUserId = nextUserId;
    emit(EMPTY);
    if (!nextUserId) return;
    const requestRevision = revision;
    fetch("/api/me/wishlist", { credentials: "same-origin", cache: "no-store" })
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok) throw new Error(body.error?.message || "Unable to load wishlist.");
        return body.data as Array<{ id: string }>;
      })
      .then((items) => { if (activeUserId === nextUserId && revision === requestRevision) emit(items.map((item) => item.id)); })
      .catch(() => { if (activeUserId === nextUserId) notify({ type: "error", title: "Wishlist unavailable", message: "Please refresh and try again." }); });
  }, [isReady, isAuthenticated, user.id, notify]);

  const toggleWishlist = async (courseId: string, courseTitle?: string, desiredSaved?: boolean): Promise<boolean> => {
    if (!isAuthenticated) {
      notify({ type: "info", title: "Sign in to save courses", message: "Your wishlist will be kept with your account." });
      router.push("/login");
      return false;
    }
    const userId = user.id;
    const removing = desiredSaved === undefined ? ids.includes(courseId) : !desiredSaved;
    revision += 1;
    emit(removing ? ids.filter((id) => id !== courseId) : [...ids, courseId]);
    try {
      const response = await fetch(removing ? `/api/me/wishlist/${encodeURIComponent(courseId)}` : "/api/me/wishlist", {
        method: removing ? "DELETE" : "POST", credentials: "same-origin",
        ...(removing ? {} : { headers: { "Content-Type": "application/json" }, body: JSON.stringify({ courseId }) }),
      });
      if (!response.ok) {
        const body = await response.json();
        throw new Error(body.error?.message || "Wishlist could not be updated.");
      }
      notify({ type: removing ? "info" : "success", title: removing ? "Removed from wishlist" : "Added to wishlist",
        message: courseTitle || "Your saved courses have been updated" });
      return true;
    } catch (error) {
      if (activeUserId === userId) emit(removing ? [...ids, courseId] : ids.filter((id) => id !== courseId));
      notify({ type: "error", title: "Wishlist not saved", message: error instanceof Error ? error.message : "Please try again." });
      return false;
    }
  };

  return <WishlistContext.Provider value={{ wishlistIds, isWishlisted: (courseId) => wishlistIds.includes(courseId), toggleWishlist }}>
    {children}
  </WishlistContext.Provider>;
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) throw new Error("useWishlist must be used within a WishlistProvider");
  return context;
}
