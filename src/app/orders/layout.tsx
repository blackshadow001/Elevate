import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Orders & Purchases — Elevate",
  robots: { index: false, follow: false },
};

export default function OrdersLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
