import { ApiError, safe } from "@/server/api";
import { verifyCertificate } from "@/server/certificates";

export async function GET(_request: Request, { params }: { params: Promise<{ certificateNumber: string }> }) {
  return safe(async () => {
    const number = (await params).certificateNumber;
    if (!/^[a-zA-Z0-9_-]{1,100}$/.test(number)) throw new ApiError(422, "INVALID_ID", "Invalid certificate number.");
    return verifyCertificate(number);
  });
}
