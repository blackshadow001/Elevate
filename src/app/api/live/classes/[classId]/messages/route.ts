import { id, json, readJson, safe } from "@/server/api";
import { requireAuth } from "@/server/auth";
import { getMessages, sendMessage } from "@/server/live";

type Context = { params: Promise<{ classId: string }> };
export async function GET(_request: Request, { params }: Context) {
  return safe(async () => getMessages(id((await params).classId), await requireAuth()));
}
export async function POST(request: Request, { params }: Context) {
  return safe(async () => json(sendMessage(id((await params).classId), await requireAuth(), await readJson(request)), 201));
}
