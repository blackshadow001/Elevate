import { ApiError, requireSameOrigin, safe } from "@/server/api";
import { requireAuth } from "@/server/auth";
import { ownBootcampRegistration, registerBootcamp, unregisterBootcamp } from "@/server/bootcamps";
import { getDb } from "@/server/db";
export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  return safe(async () => {
    requireSameOrigin(request);
    const slug = (await params).slug;
    const row = getDb().prepare("SELECT id FROM bootcamps WHERE slug=?").get(slug);
    if (!row) throw new ApiError(404, "BOOTCAMP_NOT_FOUND", "Bootcamp not found.");
    return registerBootcamp(String(row.id), await requireAuth());
  });
}
export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  return safe(async () => ownBootcampRegistration((await params).slug, await requireAuth()));
}
export async function DELETE(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  return safe(async () => {
    requireSameOrigin(request);
    return unregisterBootcamp((await params).slug, await requireAuth());
  });
}
