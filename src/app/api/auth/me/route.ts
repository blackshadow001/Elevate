import { ApiError, readJson, safe, text } from "@/server/api";
import { requireAuth } from "@/server/auth";
import { getDb } from "@/server/db";


export async function GET() { return safe(() => requireAuth()); }

export async function PATCH(request: Request) {
  return safe(async () => {
    const user = await requireAuth();
    const body = await readJson(request);
    if (Object.keys(body).some((key) => key !== "name")) {
      throw new ApiError(422, "INVALID_INPUT", "Only your display name can be changed here.");
    }
    const name = text(body.name, "Name", 2, 160);
    const db = getDb();
    db.prepare("UPDATE users SET name=?,updated_at=? WHERE id=? AND status='active'")
      .run(name, new Date().toISOString(), user.id);
    return requireAuth();
  });
}
