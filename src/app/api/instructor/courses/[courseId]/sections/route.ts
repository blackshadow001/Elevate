import { id, json, readJson, safe } from "@/server/api";
import { requireAnyRole } from "@/server/auth";
import { addSection, reorderSections } from "@/server/curriculum";

type Context = { params: Promise<{ courseId: string }> };

export async function POST(request: Request, { params }: Context) {
  return safe(async () => json(addSection(id((await params).courseId), await requireAnyRole(["instructor", "admin"]), await readJson(request)), 201));
}

export async function PUT(request: Request, { params }: Context) {
  return safe(async () => {
    const user = await requireAnyRole(["instructor", "admin"]);
    const body = await readJson(request);
    return reorderSections(id((await params).courseId), user, body.orderedIds);
  });
}
