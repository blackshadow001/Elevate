import { id, safe, ApiError } from "@/server/api";
import { requireAuth } from "@/server/auth";
import { getOwnCertificate } from "@/server/certificates";
import { createSignedCertificatePdf } from "@/server/certificatePdf";

export async function GET(request: Request, { params }: { params: Promise<{ certificateId: string }> }) {
  return safe(async () => {
    const certificate = getOwnCertificate(id((await params).certificateId), await requireAuth());
    if (certificate.status !== "valid") throw new ApiError(403, "CERTIFICATE_REVOKED", "This certificate is no longer valid.");
    const origin = process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;
    const pdf = await createSignedCertificatePdf(certificate, origin.replace(/\/$/, ""));
    return new Response(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Certificate-${certificate.certificateNumber}.pdf"`,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  });
}
