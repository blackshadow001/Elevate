import { id, readJson, requireSameOrigin, safe } from "@/server/api";
import { requireAnyRole } from "@/server/auth";
import { deleteLesson, editLesson } from "@/server/curriculum";

type Context = { params: Promise<{ courseId: string; lessonId: string }> };

export async function PATCH(request: Request, { params }: Context) {
  return safe(async () => {
    const { courseId, lessonId } = await params;
    return editLesson(id(courseId), id(lessonId), await requireAnyRole(["instructor", "admin"]), await readJson(request));
  });
}

export async function DELETE(request: Request, { params }: Context) {
  return safe(async () => {
    requireSameOrigin(request);
    const { courseId, lessonId } = await params;
    return deleteLesson(id(courseId), id(lessonId), await requireAnyRole(["instructor", "admin"]));
  });
}
