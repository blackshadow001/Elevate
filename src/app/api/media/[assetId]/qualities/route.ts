import { safe } from "@/server/api";
import { authorizedMediaAsset } from "@/server/mediaAccess";
import { VIDEO_QUALITIES } from "@/lib/videoQualities";
import { videoVariantStat } from "@/server/localMedia";

export async function GET(_request: Request, { params }: { params: Promise<{ assetId: string }> }) {
  return safe(async () => {
    const asset = await authorizedMediaAsset((await params).assetId);
    const available = (await Promise.all(VIDEO_QUALITIES.map(async (quality) =>
      (await videoVariantStat(asset.storageKey, quality).then(() => true, () => false)) ? quality : null,
    ))).filter((quality) => quality !== null);
    return Response.json({ available, dataSaver: available.includes("720p") }, { headers: { "Cache-Control": "private, no-store" } });
  });
}
