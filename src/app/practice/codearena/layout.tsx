import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CodeArena — 100 Progressive Coding Challenges & Algorithm Sandbox",
  description: "Tackle 100 levels of progressive data structures and algorithms challenges in JavaScript, Python, and TypeScript with real-time test execution and performance stats.",
  alternates: { canonical: "https://elevate.courses/practice/codearena" },
  openGraph: {
    title: "CodeArena — 100 Coding Challenges | Elevate Practice",
    description: "Tackle 100 levels of progressive data structures and algorithms challenges in JavaScript, Python, and TypeScript.",
    url: "https://elevate.courses/practice/codearena",
    siteName: "Elevate",
    type: "website",
  },
};

export default function CodeArenaLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
