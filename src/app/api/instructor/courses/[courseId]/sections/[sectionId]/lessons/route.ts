import { id, json, readJson, safe } from "@/server/api";
import { requireAnyRole } from "@/server/auth";
import { addLesson, reorderLessons } from "@/server/curriculum";

type Context = { params: Promise<{ courseId: string; sectionId: string }> };

export async function POST(request: Request, { params }: Context) {
  return safe(async () => {
    const { courseId, sectionId } = await params;
    return json(addLesson(id(courseId), id(sectionId), await requireAnyRole(["instructor", "admin"]), await readJson(request)), 201);
  });
}

export async function PUT(request: Request, { params }: Context) {
  return safe(async () => {
    const { courseId, sectionId } = await params;
    const user = await requireAnyRole(["instructor", "admin"]);
    const body = await readJson(request);
    return reorderLessons(id(courseId), id(sectionId), user, body.orderedIds);
  });
}
