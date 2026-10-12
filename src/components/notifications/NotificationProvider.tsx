"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { CheckCircle2, Info, AlertTriangle, AlertCircle, X } from "lucide-react";
import { NotificationItem, NotificationType } from "./notificationTypes";

interface NotificationContextType {
  notify: (options: {
    type?: NotificationType;
    title: string;
    message?: string;
    duration?: number;
  }) => void;
  dismissCurrent: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [current, setCurrent] = useState<NotificationItem | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const currentRef = useRef<NotificationItem | null>(null);
  const queueRef = useRef<NotificationItem[]>([]);
  const dismissTimerRef = useRef<NodeJS.Timeout | null>(null);
  const cleanupTimerRef = useRef<NodeJS.Timeout | null>(null);

  const showItem = (item: NotificationItem) => {
    currentRef.current = item;
    setCurrent(item);
    setIsVisible(true);
    dismissTimerRef.current = setTimeout(() => handleDismiss(), item.duration);
  };

  const handleDismiss = () => {
    if (!currentRef.current) return;
    setIsVisible(false);
    if (dismissTimerRef.current) {
      clearTimeout(dismissTimerRef.current);
      dismissTimerRef.current = null;
    }
    if (cleanupTimerRef.current) {
      clearTimeout(cleanupTimerRef.current);
    }
    // Fast 150ms exit transition
    cleanupTimerRef.current = setTimeout(() => {
      const next = queueRef.current.shift();
      if (next) showItem(next);
      else {
        currentRef.current = null;
        setCurrent(null);
      }
    }, 150);
  };

  const notify = ({
    type = "success",
    title,
    message,
    duration = 2400,
  }: {
    type?: NotificationType;
    title: string;
    message?: string;
    duration?: number;
  }) => {
    const item: NotificationItem = {
      id: Math.random().toString(36).substring(2, 9),
      type,
      title,
      message,
      duration,
    };

    const duplicate = (candidate: NotificationItem) =>
      candidate.type === item.type && candidate.title === item.title && candidate.message === item.message;
    if ((currentRef.current && duplicate(currentRef.current)) || queueRef.current.some(duplicate)) return;
    if (currentRef.current) queueRef.current.push(item);
    else showItem(item);
  };

  useEffect(() => {
    return () => {
      if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
      if (cleanupTimerRef.current) clearTimeout(cleanupTimerRef.current);
    };
  }, []);

  return (
    <NotificationContext.Provider value={{ notify, dismissCurrent: handleDismiss }}>
      {children}

      {/* Single Notification Viewport Container */}
      <div
        aria-live="polite"
        className="fixed bottom-4 left-4 right-4 z-[120] w-auto pointer-events-none sm:bottom-6 sm:left-auto sm:right-6 sm:w-full sm:max-w-[400px]"
      >
        {current && (
          <div
            role="alert"
            className={`pointer-events-auto flex items-start justify-between gap-3 bg-[#172033] text-white p-4 rounded-2xl shadow-2xl border border-[#26344D] transition-all duration-150 ease-out ${
              isVisible
                ? "opacity-100 translate-y-0 scale-100"
                : "opacity-0 translate-y-2 scale-98 pointer-events-none"
            }`}
          >
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className="shrink-0 mt-0.5">
                {current.type === "success" && (
                  <CheckCircle2 className="w-5 h-5 text-[#FF6B35]" />
                )}
                {current.type === "info" && (
                  <Info className="w-5 h-5 text-blue-400" />
                )}
                {current.type === "warning" && (
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                )}
                {current.type === "error" && (
                  <AlertCircle className="w-5 h-5 text-red-400" />
                )}
              </div>

              <div className="space-y-0.5 min-w-0 flex-1">
                <h4 className="text-sm font-bold text-white tracking-tight leading-snug">
                  {current.title}
                </h4>
                {current.message && (
                  <p className="text-xs text-[#94A3B8] leading-relaxed line-clamp-2">
                    {current.message}
                  </p>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={handleDismiss}
              className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors shrink-0"
              aria-label="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within a NotificationProvider");
  }
  return context;
}
