import { ApiError, safe } from "@/server/api";
import { getEvent } from "@/server/events";
export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  return safe(async () => {
    const slug = (await params).slug;
    if (!/^[a-z0-9-]{1,100}$/.test(slug)) throw new ApiError(422, "INVALID_SLUG", "Invalid event slug.");
    return getEvent(slug);
  });
}
