import { json, readJson, safe } from "@/server/api";
import { requireAnyRole } from "@/server/auth";
import { saveCourseDraft } from "@/server/courseDraft";

export async function POST(request: Request) {
  return safe(async () => json(await saveCourseDraft(await requireAnyRole(["instructor", "admin"]), await readJson(request, 524288))));
}
