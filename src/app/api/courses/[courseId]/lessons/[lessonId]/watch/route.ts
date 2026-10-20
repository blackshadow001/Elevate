import { id, readJson, safe } from "@/server/api";
import { requireAuth } from "@/server/auth";
import { recordVideoWatch } from "@/server/videoWatch";

type Context = { params: Promise<{ courseId: string; lessonId: string }> };

export async function POST(request: Request, { params }: Context) {
  return safe(async () => {
    const { courseId, lessonId } = await params;
    return recordVideoWatch(id(courseId), id(lessonId), await requireAuth(), await readJson(request));
  });
}
