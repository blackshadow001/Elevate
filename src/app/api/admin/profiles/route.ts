import { json, readJson, safe } from "@/server/api";
import { requireSuperAdmin } from "@/server/auth";
import { createSubAdmin, listAdminProfiles } from "@/server/adminCredentials";

export async function GET() {
  return safe(async () => {
    await requireSuperAdmin();
    return { items: listAdminProfiles() };
  });
}

export async function POST(request: Request) {
  return safe(async () => {
    const actor = await requireSuperAdmin();
    const body = await readJson(request);
    return json(createSubAdmin(actor.id, body), 201);
  });
}
