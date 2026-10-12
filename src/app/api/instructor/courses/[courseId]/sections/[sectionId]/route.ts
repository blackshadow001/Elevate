import { id, readJson, requireSameOrigin, safe } from "@/server/api";
import { requireAnyRole } from "@/server/auth";
import { deleteSection, editSection } from "@/server/curriculum";

type Context = { params: Promise<{ courseId: string; sectionId: string }> };

export async function PATCH(request: Request, { params }: Context) {
  return safe(async () => {
    const { courseId, sectionId } = await params;
    return editSection(id(courseId), id(sectionId), await requireAnyRole(["instructor", "admin"]), await readJson(request));
  });
}

export async function DELETE(request: Request, { params }: Context) {
  return safe(async () => {
    requireSameOrigin(request);
    const { courseId, sectionId } = await params;
    return deleteSection(id(courseId), id(sectionId), await requireAnyRole(["instructor", "admin"]));
  });
}
