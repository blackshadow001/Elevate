import { json, readJson, safe } from "@/server/api";
import { requireAnyRole } from "@/server/auth";
import { createGuidedPath, ownGuidedPaths } from "@/server/guidedPaths";

export async function GET() { return safe(async () => ownGuidedPaths(await requireAnyRole(["instructor", "admin"]))); }
export async function POST(request: Request) {
  return safe(async () => json(createGuidedPath(await requireAnyRole(["instructor", "admin"]), await readJson(request)), 201));
}
