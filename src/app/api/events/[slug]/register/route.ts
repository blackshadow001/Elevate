import { ApiError, requireSameOrigin, safe } from "@/server/api";
import { requireAuth } from "@/server/auth";
import { ownEventRegistration, registerEvent, unregisterEvent } from "@/server/events";
export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  return safe(async () => {
    requireSameOrigin(request);
    const slug = (await params).slug;
    if (!/^[a-z0-9-]{1,100}$/.test(slug)) throw new ApiError(422, "INVALID_SLUG", "Invalid event slug.");
    return registerEvent(slug, await requireAuth());
  });
}
export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  return safe(async () => ownEventRegistration((await params).slug, await requireAuth()));
}
export async function DELETE(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  return safe(async () => { requireSameOrigin(request); return unregisterEvent((await params).slug, await requireAuth()); });
}
