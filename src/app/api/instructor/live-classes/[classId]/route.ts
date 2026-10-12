import { id, readJson, requireSameOrigin, safe } from "@/server/api";
import { requireAnyRole } from "@/server/auth";
import { updateLiveClass } from "@/server/live";

type Context = { params: Promise<{ classId: string }> };
export async function PATCH(request: Request, { params }: Context) {
  return safe(async () => updateLiveClass(id((await params).classId), await requireAnyRole(["instructor", "admin"]), await readJson(request)));
}
export async function DELETE(request: Request, { params }: Context) {
  return safe(async () => {
    requireSameOrigin(request);
    return updateLiveClass(id((await params).classId), await requireAnyRole(["instructor", "admin"]), { status: "cancelled" });
  });
}
