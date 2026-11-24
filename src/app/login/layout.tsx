import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In — Elevate",
  description: "Sign in to your Elevate account to access enrolled courses and learning progress.",
  robots: { index: false, follow: false },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
