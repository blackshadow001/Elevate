import { ApiError, id, readJson, safe, text } from "@/server/api";
import { requireRole } from "@/server/auth";
import { adminReview, ReviewAction } from "@/server/courseApproval";

export async function POST(request: Request, { params }: { params: Promise<{ courseId: string }> }) {
  return safe(async () => {
    const admin = await requireRole("admin");
    const body = await readJson(request);
    if (!["approve", "reject", "publish", "unpublish"].includes(String(body.action)))
      throw new ApiError(422, "INVALID_ACTION", "Unsupported review action.");
    return adminReview(id((await params).courseId), admin, body.action as ReviewAction,
      text(body.feedback ?? "", "Feedback", 0, 2000));
  });
}
