import { ApiError, safe } from "@/server/api";
import { authorizedMediaAsset } from "@/server/mediaAccess";
import { dataSaverStat, dataSaverStream, localMediaStat, localMediaStream } from "@/server/localMedia";

export async function GET(request: Request, { params }: { params: Promise<{ assetId: string }> }) {
  return safe(async () => {
    const asset = await authorizedMediaAsset((await params).assetId);
    const quality = new URL(request.url).searchParams.get("quality");
    if (quality !== null && quality !== "720p")
      throw new ApiError(400, "INVALID_QUALITY", "Choose Original or Data saver quality.");
    const dataSaver = quality === "720p";
    let info;
    try { info = await (dataSaver ? dataSaverStat(asset.storageKey) : localMediaStat(asset.storageKey)); }
    catch { throw new ApiError(404, "MEDIA_NOT_FOUND", "Media file is unavailable."); }
    const total = info.size;
    const range = request.headers.get("range");
    let start = 0;
    let end = total - 1;
    if (range) {
      const match = /^bytes=(\d+)-(\d*)$/.exec(range);
      if (!match) throw new ApiError(416, "INVALID_RANGE", "Only a single byte range is supported.");
      start = Number(match[1]);
      end = match[2] ? Number(match[2]) : end;
      if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start > end || end >= total)
        throw new ApiError(416, "INVALID_RANGE", "The requested byte range is unavailable.");
    }
    return new Response(dataSaver ? dataSaverStream(asset.storageKey, start, end) : localMediaStream(asset.storageKey, start, end), {
      status: range ? 206 : 200,
      headers: {
        "Content-Type": dataSaver ? "video/mp4" : asset.mimeType,
        "Content-Length": String(end - start + 1),
        "Accept-Ranges": "bytes",
        ...(range ? { "Content-Range": `bytes ${start}-${end}/${total}` } : {}),
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  });
}
