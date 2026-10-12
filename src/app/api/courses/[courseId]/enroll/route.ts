import { id, requireSameOrigin, safe } from "@/server/api";
import { requireAuth } from "@/server/auth";
import { enrollFreeCourse } from "@/server/learning";

export async function POST(request: Request, { params }: { params: Promise<{ courseId: string }> }) {
  return safe(async () => {
    requireSameOrigin(request);
    return enrollFreeCourse(id((await params).courseId), await requireAuth());
  });
}
