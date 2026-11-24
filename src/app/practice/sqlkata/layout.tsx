import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SqlKata — SQL Query Sandbox",
  alternates: { canonical: "https://elevate.courses/practice/querymaster" },
};

export default function SqlKataLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
