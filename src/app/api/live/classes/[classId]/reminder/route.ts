import { id, requireSameOrigin, safe } from "@/server/api";
import { requireAuth } from "@/server/auth";
import { ownReminder, removeReminder, setReminder } from "@/server/live";
type Context = { params: Promise<{ classId: string }> };
export async function GET(_request: Request, { params }: Context) {
  return safe(async () => ownReminder(id((await params).classId), await requireAuth()));
}
export async function POST(request: Request, { params }: Context) {
  return safe(async () => { requireSameOrigin(request); return setReminder(id((await params).classId), await requireAuth()); });
}
export async function DELETE(request: Request, { params }: Context) {
  return safe(async () => { requireSameOrigin(request); return removeReminder(id((await params).classId), await requireAuth()); });
}
