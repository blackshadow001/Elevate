import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "WebForge — Live Frontend Web Component Studio",
  description: "Build, preview, and test modern responsive HTML, CSS, and React components with an instant live preview sandbox in your browser.",
  alternates: { canonical: "https://elevate.courses/practice/webforge" },
  openGraph: {
    title: "WebForge — Frontend Component Sandbox | Elevate Practice",
    description: "Build, preview, and test modern responsive HTML, CSS, and React components with an instant live preview.",
    url: "https://elevate.courses/practice/webforge",
    siteName: "Elevate",
    type: "website",
  },
};

export default function WebForgeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
