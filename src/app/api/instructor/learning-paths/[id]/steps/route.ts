import { json, readJson, safe } from "@/server/api";
import { requireAnyRole } from "@/server/auth";
import { addGuidedStep } from "@/server/guidedPaths";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return safe(async () => json(addGuidedStep((await params).id, await requireAnyRole(["instructor", "admin"]), await readJson(request)), 201));
}
