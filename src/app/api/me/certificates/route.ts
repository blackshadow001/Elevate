import { safe } from "@/server/api";
import { requireAuth } from "@/server/auth";
import { listOwnCertificates } from "@/server/certificates";

export async function GET() { return safe(async () => listOwnCertificates(await requireAuth())); }
