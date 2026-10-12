import CertificateVerifyPage from "./[certificateId]/page";

export const metadata = {
  title: "Verify Certificate — Elevate",
  description: "Official credential authenticity lookup for Elevate certificates.",
};

export default function VerifyIndexPage() {
  return <CertificateVerifyPage params={Promise.resolve({ certificateId: "" })} />;
}
