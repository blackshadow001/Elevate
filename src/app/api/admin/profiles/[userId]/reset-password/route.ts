import { id, readJson, safe } from "@/server/api";
import { requireSuperAdmin } from "@/server/auth";
import { resetSubAdminPassword } from "@/server/adminCredentials";

export async function POST(request: Request, { params }: { params: Promise<{ userId: string }> }) {
  return safe(async () => {
    const actor = await requireSuperAdmin();
    const target = id((await params).userId);
    const body = await readJson(request);
    return resetSubAdminPassword(actor.id, target, body);
  });
}
