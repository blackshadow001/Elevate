import { id, requireSameOrigin, safe } from "@/server/api";
import { requireAnyRole } from "@/server/auth";
import { moderateMessage } from "@/server/live";

export async function DELETE(request: Request, { params }: { params: Promise<{ classId: string; messageId: string }> }) {
  return safe(async () => {
    requireSameOrigin(request);
    const { classId, messageId } = await params;
    return moderateMessage(id(classId), id(messageId), await requireAnyRole(["instructor", "admin"]));
  });
}
