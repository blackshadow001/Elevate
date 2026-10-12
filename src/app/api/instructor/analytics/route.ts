import { safe } from "@/server/api";
import { requireAnyRole } from "@/server/auth";
import { instructorAnalytics } from "@/server/analytics";
export async function GET() { return safe(async () => instructorAnalytics(await requireAnyRole(["instructor", "admin"]))); }
