"use client";

import { useSyncExternalStore } from "react";
import Script from "next/script";

const subscribe = () => () => {};

export function AccessibilityWidget({ siteUrl }: { siteUrl: string }) {
  const onSite = useSyncExternalStore(subscribe,
    () => window.location.origin === new URL(siteUrl).origin, () => false);

  if (!onSite) return null;

  return <Script
    src="https://a11yease.tech/embed.js"
    data-key="ae_live_dffd31ce2e721c9731d2a1b2567234d99011ce3c43735aaa544203b11adfa507"
    strategy="afterInteractive"
  />;
}
