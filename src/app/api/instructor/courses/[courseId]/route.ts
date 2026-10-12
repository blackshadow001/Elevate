import { ApiError, id, readJson, requireSameOrigin, safe } from "@/server/api";
import { requireAnyRole } from "@/server/auth";
import { getCourse, ownedCourse, setCourseStatus, updateCourse } from "@/server/courses";

type Context = { params: Promise<{ courseId: string }> };

export async function GET(_request: Request, { params }: Context) {
  return safe(async () => {
    const user = await requireAnyRole(["instructor", "admin"]);
    const courseId = id((await params).courseId);
    ownedCourse(courseId, user);
    return getCourse(courseId, false);
  });
}

export async function PATCH(request: Request, { params }: Context) {
  return safe(async () => {
    const user = await requireAnyRole(["instructor", "admin"]);
    const courseId = id((await params).courseId);
    const body = await readJson(request);
    if (body.status !== undefined) {
      if (!["draft", "published", "pending_approval", "archived"].includes(String(body.status))) {
        throw new ApiError(422, "INVALID_STATUS", "Invalid course status.");
      }
      return setCourseStatus(courseId, user, body.status === "pending_approval" ? "published" : body.status as "draft" | "published" | "archived");
    }
    return updateCourse(courseId, user, body);
  });
}

export async function DELETE(request: Request, { params }: Context) {
  return safe(async () => {
    const user = await requireAnyRole(["instructor", "admin"]);
    requireSameOrigin(request);
    return setCourseStatus(id((await params).courseId), user, "archived");
  });
}
