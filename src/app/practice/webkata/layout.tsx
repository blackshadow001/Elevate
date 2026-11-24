import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "WebKata — Frontend Web Sandbox",
  alternates: { canonical: "https://elevate.courses/practice/webforge" },
};

export default function WebKataLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
