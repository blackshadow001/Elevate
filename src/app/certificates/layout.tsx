import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verify Elevate Certificate of Completion",
  description: "Official credential authenticity and verification portal for certificates issued by Elevate.",
  alternates: { canonical: "https://elevate.courses/certificates/verify" },
  openGraph: {
    title: "Verify Certificate of Completion — Elevate",
    description: "Official credential authenticity lookup for Elevate certificates.",
    url: "https://elevate.courses/certificates/verify",
    siteName: "Elevate",
    type: "website",
  },
};

export default function CertificatesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
