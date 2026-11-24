import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CodeKata — Algorithm & Coding Sandbox",
  alternates: { canonical: "https://elevate.courses/practice/codearena" },
};

export default function CodeKataLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
