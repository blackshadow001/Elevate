import { safe } from "@/server/api";
import { requireAuth } from "@/server/auth";
import { getOwnEnrollments } from "@/server/learning";

export async function GET() { return safe(async () => getOwnEnrollments(await requireAuth())); }
