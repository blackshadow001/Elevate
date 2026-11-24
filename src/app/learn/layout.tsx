import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Course Player — Elevate",
  robots: { index: false, follow: false },
};

export default function LearnLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
