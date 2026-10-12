import { ApiError, id, number, readJson, safe, text } from "@/server/api";
import { requireAnyRole } from "@/server/auth";
import { ownedCourse } from "@/server/courses";
import { mediaService } from "@/server/integrations";

export async function POST(request: Request, { params }: { params: Promise<{ courseId: string }> }) {
  return safe(async () => {
    const user = await requireAnyRole(["instructor", "admin"]);
    ownedCourse(id((await params).courseId), user);
    const body = await readJson(request);
    const mimeType = text(body.mimeType, "MIME type", 3, 100);
    if (!/^(video\/(mp4|webm)|application\/pdf|image\/(png|jpeg|webp))$/.test(mimeType)) {
      throw new ApiError(422, "INVALID_MEDIA_TYPE", "This media type is not supported.");
    }
    const sizeBytes = number(body.sizeBytes, "File size", 1, 2_000_000_000);
    if (!Number.isInteger(sizeBytes)) throw new ApiError(422, "INVALID_INPUT", "File size must be whole bytes.");
    return mediaService.createUploadUrl({ storageKey: `${user.id}/${crypto.randomUUID()}`, mimeType, sizeBytes });
  });
}
