import { json, readJson, safe } from "@/server/api";
import { requireAnyRole } from "@/server/auth";
import { createLiveClass, listOwnLiveClasses } from "@/server/live";

export async function GET() { return safe(async () => listOwnLiveClasses(await requireAnyRole(["instructor", "admin"]))); }
export async function POST(request: Request) {
  return safe(async () => json(createLiveClass(await requireAnyRole(["instructor", "admin"]), await readJson(request)), 201));
}
