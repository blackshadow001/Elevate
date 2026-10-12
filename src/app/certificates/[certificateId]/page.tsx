import { CertificateDetailClient } from "@/components/certificates/CertificateDetailClient";

interface PageProps {
  params: Promise<{ certificateId: string }>;
}

export default async function CertificateDetailPage({ params }: PageProps) {
  const { certificateId } = await params;
  return <CertificateDetailClient certificateId={certificateId} />;
}
