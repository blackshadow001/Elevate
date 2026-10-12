import { ApiError, id, readJson, safe, text } from "@/server/api";
import { requireRole } from "@/server/auth";
import { adminPricingDecision, adminSetPricing } from "@/server/courseApproval";

type Context = { params: Promise<{ courseId: string }> };
export async function PUT(request: Request, { params }: Context) {
  return safe(async () => adminSetPricing(id((await params).courseId), await requireRole("admin"), await readJson(request)));
}
export async function POST(request: Request, { params }: Context) {
  return safe(async () => {
    const admin = await requireRole("admin");
    const body = await readJson(request);
    if (!["approve", "reject", "request_changes"].includes(String(body.action)))
      throw new ApiError(422, "INVALID_ACTION", "Unsupported pricing action.");
    return adminPricingDecision(id((await params).courseId), admin,
      body.action as "approve" | "reject" | "request_changes", body.marginBps,
      text(body.feedback ?? "", "Feedback", 0, 2000));
  });
}
