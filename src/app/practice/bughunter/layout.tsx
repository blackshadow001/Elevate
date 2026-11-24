import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "BugHunter — Production Code Debugging Simulator",
  description: "Diagnose, isolate, and fix realistic production bugs and edge cases across modern fullstack applications with instant test feedback.",
  alternates: { canonical: "https://elevate.courses/practice/bughunter" },
  openGraph: {
    title: "BugHunter — Code Debugging Simulator | Elevate Practice",
    description: "Diagnose, isolate, and fix realistic production bugs across modern fullstack applications.",
    url: "https://elevate.courses/practice/bughunter",
    siteName: "Elevate",
    type: "website",
  },
};

export default function BugHunterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
