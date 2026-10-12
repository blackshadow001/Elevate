import { id, safe } from "@/server/api";
import { getCourse } from "@/server/courses";

export async function GET(_request: Request, { params }: { params: Promise<{ courseId: string }> }) {
  return safe(async () => getCourse(id((await params).courseId)));
}
