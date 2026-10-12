import { id, readJson, requireSameOrigin, safe } from "@/server/api";
import { requireAnyRole } from "@/server/auth";
import { deleteSession, updateSession } from "@/server/bootcamps";
type Context = { params: Promise<{ bootcampId: string; sessionId: string }> };
export async function PATCH(request: Request, { params }: Context) {
  return safe(async () => {
    const { bootcampId, sessionId } = await params;
    return updateSession(id(bootcampId), id(sessionId), await requireAnyRole(["instructor", "admin"]), await readJson(request));
  });
}
export async function DELETE(request: Request, { params }: Context) {
  return safe(async () => {
    requireSameOrigin(request);
    const { bootcampId, sessionId } = await params;
    return deleteSession(id(bootcampId), id(sessionId), await requireAnyRole(["instructor", "admin"]));
  });
}
