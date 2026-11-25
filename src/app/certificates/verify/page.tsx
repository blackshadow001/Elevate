import type { Metadata } from "next";
import CertificateVerifyPage from "./[certificateId]/page";

export const metadata: Metadata = {
  title: "Verify Elevate Certificate of Completion",
  description: "Official credential authenticity lookup and verification portal for certificates issued by Elevate.",
  robots: { index: true, follow: true },
  alternates: { canonical: "https://elevate.courses/certificates/verify" },
  openGraph: {
    title: "Verify Certificate of Completion — Elevate",
    description: "Official credential authenticity lookup for Elevate certificates.",
    url: "https://elevate.courses/certificates/verify",
    siteName: "Elevate",
    type: "website",
  },
};

export default function VerifyIndexPage() {
  return <CertificateVerifyPage params={Promise.resolve({ certificateId: "" })} />;
}
