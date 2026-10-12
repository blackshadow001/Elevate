import { id, safe } from "@/server/api";
import { requireRole } from "@/server/auth";
import { adminCourseDetail } from "@/server/courseApproval";
import { getCourse } from "@/server/courses";

export async function GET(_request: Request, { params }: { params: Promise<{ courseId: string }> }) {
  return safe(async () => {
    await requireRole("admin");
    const courseId = id((await params).courseId);
    return { course: getCourse(courseId, false), ...adminCourseDetail(courseId) };
  });
}
