import { safe } from "@/server/api";
import { authorizedMediaAsset } from "@/server/mediaAccess";

export async function GET(_request: Request, { params }: { params: Promise<{ assetId: string }> }) {
  return safe(async () => {
    const asset = await authorizedMediaAsset((await params).assetId);
    return { url: `/api/media/${asset.id}/stream`, expiresAt: null };
  });
}
