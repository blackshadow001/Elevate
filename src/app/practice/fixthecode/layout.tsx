import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FixTheCode — Debugging Simulator",
  alternates: { canonical: "https://elevate.courses/practice/bughunter" },
};

export default function FixTheCodeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
