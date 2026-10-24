import { safe } from "@/server/api";
import { publicAvatarResponse } from "@/server/avatar";

export async function GET(_request: Request, { params }: { params: Promise<{ key: string }> }) {
  return safe(async () => publicAvatarResponse((await params).key));
}
