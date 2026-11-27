import { safe } from "@/server/api";
import { requireRole } from "@/server/auth";
import { reviewGuidedPaths } from "@/server/guidedPaths";

export async function GET() { return safe(async () => { await requireRole("admin"); return reviewGuidedPaths(); }); }
