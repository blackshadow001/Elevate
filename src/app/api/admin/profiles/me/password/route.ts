import { readJson, safe } from "@/server/api";
import { requireSuperAdmin, revokeSession } from "@/server/auth";
import { changeOwnSuperPassword } from "@/server/adminCredentials";

export async function POST(request: Request) {
  return safe(async () => {
    const actor = await requireSuperAdmin();
    const body = await readJson(request);
    const result = changeOwnSuperPassword(actor.id, body);
    await revokeSession();
    return result;
  });
}
