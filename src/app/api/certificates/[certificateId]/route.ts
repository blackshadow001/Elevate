import { id, safe } from "@/server/api";
import { requireAuth } from "@/server/auth";
import { getOwnCertificate } from "@/server/certificates";

export async function GET(_request: Request, { params }: { params: Promise<{ certificateId: string }> }) {
  return safe(async () => getOwnCertificate(id((await params).certificateId), await requireAuth()));
}
