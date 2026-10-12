import { safe } from "@/server/api";
import { requireAuth } from "@/server/auth";
import { learnerAnalytics } from "@/server/analytics";
export async function GET() { return safe(async () => learnerAnalytics(await requireAuth())); }
