"use client";

import React from "react";
import { NotificationProvider } from "@/components/notifications/NotificationProvider";
import { WishlistProvider } from "@/context/WishlistContext";
import { AuthProvider } from "@/context/AuthContext";
import { ActionDialogProvider } from "@/components/ui/ActionDialogProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ActionDialogProvider>
        <NotificationProvider>
          <WishlistProvider>
            {children}
          </WishlistProvider>
        </NotificationProvider>
      </ActionDialogProvider>
    </AuthProvider>
  );
}
