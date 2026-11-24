import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "%s | Elevate Practice",
    default: "Practice Hub — Interactive Coding & Engineering Sandbox | Elevate",
  },
  description: "Sharpen your software engineering skills with Elevate Practice. Solve 100 levels of progressive algorithmic coding challenges, master SQL queries, build frontend components, and debug real production code.",
  alternates: { canonical: "https://elevate.courses/practice" },
  openGraph: {
    title: "Practice Hub — Elevate",
    description: "100-Level Algorithmic Coding Challenges, SQL runner, web development sandbox, and online compiler on Elevate.",
    url: "https://elevate.courses/practice",
    siteName: "Elevate",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://elevate.courses/branding/elevate-orange-ribbon-logo.png",
        width: 1119,
        height: 337,
        alt: "Elevate Practice Hub",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Practice Hub — Elevate",
    description: "100-Level Algorithmic Coding Challenges, SQL runner, web development sandbox, and online compiler on Elevate.",
    images: ["https://elevate.courses/branding/elevate-orange-ribbon-logo.png"],
  },
};

export default function PracticeRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
