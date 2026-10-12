import { id, readJson, safe } from "@/server/api";
import { requireAuth } from "@/server/auth";
import { updateProgress } from "@/server/learning";

type Context = { params: Promise<{ courseId: string; lessonId: string }> };
export async function PUT(request: Request, { params }: Context) {
  return safe(async () => {
    const { courseId, lessonId } = await params;
    return updateProgress(id(courseId), id(lessonId), await requireAuth(), await readJson(request));
  });
}
