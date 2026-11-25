import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Certificates — Elevate",
  description: "View and download your earned Elevate certificates of completion.",
  robots: { index: false, follow: false },
};

export default function CertificatesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
