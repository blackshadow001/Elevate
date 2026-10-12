import { id, readJson, safe } from "@/server/api";
import { requireAnyRole } from "@/server/auth";
import { updateBootcamp } from "@/server/bootcamps";
export async function PATCH(request: Request, { params }: { params: Promise<{ bootcampId: string }> }) {
  return safe(async () => updateBootcamp(id((await params).bootcampId), await requireAnyRole(["instructor", "admin"]), await readJson(request)));
}
