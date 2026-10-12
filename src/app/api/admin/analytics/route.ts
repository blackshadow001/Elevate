import { safe } from "@/server/api";
import { requireRole } from "@/server/auth";
import { getAdminOverview } from "@/server/adminOverview";

export async function GET() {
  return safe(async () => {
    await requireRole("admin");
    return getAdminOverview();
  });
}
