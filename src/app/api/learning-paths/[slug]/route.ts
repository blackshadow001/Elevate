import { safe } from "@/server/api";
import { currentUser } from "@/server/auth";
import { guidedPath } from "@/server/guidedPaths";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  return safe(async () => guidedPath((await params).slug, await currentUser()));
}
