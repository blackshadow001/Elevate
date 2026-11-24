import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Account — Elevate",
  description: "Create an Elevate account to start learning practical tech and business skills.",
  robots: { index: false, follow: false },
};

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
