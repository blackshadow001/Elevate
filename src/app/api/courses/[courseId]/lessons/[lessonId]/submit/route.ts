import { id, readJson, safe } from "@/server/api";
import { requireAuth } from "@/server/auth";
import { submitActivity } from "@/server/lessonActivities";

type Context = { params: Promise<{ courseId: string; lessonId: string }> };
export async function POST(request: Request, { params }: Context) {
  return safe(async () => {
    const user = await requireAuth();
    const { courseId, lessonId } = await params;
    const body = await readJson(request, 16_384);
    return submitActivity(id(courseId), id(lessonId), user, body.response);
  });
}
