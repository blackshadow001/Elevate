import { json, readJson, safe } from "@/server/api";
import { requireAnyRole } from "@/server/auth";
import { createBootcamp, listOwnBootcamps } from "@/server/bootcamps";
export async function GET() { return safe(async () => listOwnBootcamps(await requireAnyRole(["instructor", "admin"]))); }
export async function POST(request: Request) {
  return safe(async () => json(createBootcamp(await requireAnyRole(["instructor", "admin"]), await readJson(request)), 201));
}
