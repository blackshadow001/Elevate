import { json, requireSameOrigin, safe } from "@/server/api";
import { requireAuth } from "@/server/auth";
import { removeAvatar, saveAvatar } from "@/server/avatar";

export async function POST(request: Request) {
  return safe(async () => {
    requireSameOrigin(request);
    const user = await requireAuth();
    return json({ avatar: await saveAvatar(user.id, request) }, 201);
  });
}

export async function DELETE(request: Request) {
  return safe(async () => {
    requireSameOrigin(request);
    const user = await requireAuth();
    await removeAvatar(user.id);
    return { avatar: null };
  });
}
