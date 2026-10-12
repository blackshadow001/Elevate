import { requireSameOrigin, safe } from "@/server/api";
import { revokeSession } from "@/server/auth";


export async function POST(request: Request) {
  return safe(async () => {
    requireSameOrigin(request);
    await revokeSession();
    return { signedOut: true };
  });
}
