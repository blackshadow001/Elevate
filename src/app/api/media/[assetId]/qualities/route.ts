import { safe } from "@/server/api";
import { authorizedMediaAsset } from "@/server/mediaAccess";
import { dataSaverStat } from "@/server/localMedia";

export async function GET(_request: Request, { params }: { params: Promise<{ assetId: string }> }) {
  return safe(async () => {
    const asset = await authorizedMediaAsset((await params).assetId);
    const dataSaver = await dataSaverStat(asset.storageKey).then(() => true, () => false);
    return Response.json({ dataSaver }, { headers: { "Cache-Control": "private, no-store" } });
  });
}
