import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CloudStudio — In-Browser IDE & Fullstack Cloud Sandbox",
  description: "Zero-setup in-browser cloud workspace with live terminal, multiple language runtimes (JS, Python, Go, Rust), and instant code execution.",
  alternates: { canonical: "https://elevate.courses/practice/cloudstudio" },
  openGraph: {
    title: "CloudStudio — In-Browser Cloud IDE | Elevate Practice",
    description: "Zero-setup in-browser cloud workspace with live terminal and multi-language compiler.",
    url: "https://elevate.courses/practice/cloudstudio",
    siteName: "Elevate",
    type: "website",
  },
};

export default function CloudStudioLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
