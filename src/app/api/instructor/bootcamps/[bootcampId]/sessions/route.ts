import { id, json, readJson, safe } from "@/server/api";
import { requireAnyRole } from "@/server/auth";
import { addSession, reorderSessions } from "@/server/bootcamps";
type Context = { params: Promise<{ bootcampId: string }> };
export async function POST(request: Request, { params }: Context) {
  return safe(async () => json(addSession(id((await params).bootcampId), await requireAnyRole(["instructor", "admin"]), await readJson(request)), 201));
}
export async function PUT(request: Request, { params }: Context) {
  return safe(async () => {
    const body = await readJson(request);
    return reorderSessions(id((await params).bootcampId), await requireAnyRole(["instructor", "admin"]), body.orderedIds);
  });
}
