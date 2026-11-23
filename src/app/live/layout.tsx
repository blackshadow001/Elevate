import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Live Learning & Masterclasses — Elevate",
  description: "Join interactive live classes, workshops, and bootcamps on Elevate. Learn practical tech and business skills directly from industry experts.",
  alternates: { canonical: "https://elevate.courses/live" },
  openGraph: {
    title: "Live Learning & Masterclasses — Elevate",
    description: "Join interactive live classes, workshops, and bootcamps on Elevate. Learn practical tech and business skills directly from industry experts.",
    url: "https://elevate.courses/live",
  },
};

export default function LiveLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
