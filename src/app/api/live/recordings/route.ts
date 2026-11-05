import { safe } from "@/server/api";
import { requireAuth } from "@/server/auth";
import { listRecordingsForUser } from "@/server/live";

export async function GET() {
  return safe(async () => listRecordingsForUser(await requireAuth()));
}
