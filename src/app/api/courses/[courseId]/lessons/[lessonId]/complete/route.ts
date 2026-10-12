import { id, requireSameOrigin, safe } from "@/server/api";
import { requireAuth } from "@/server/auth";
import { updateProgress } from "@/server/learning";

type Context = { params: Promise<{ courseId: string; lessonId: string }> };
export async function POST(request: Request, { params }: Context) {
  return safe(async () => {
    requireSameOrigin(request);
    const { courseId, lessonId } = await params;
    return updateProgress(id(courseId), id(lessonId), await requireAuth(), { completed: true });
  });
}
