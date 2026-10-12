import { ApiError, readJson, safe, text } from "@/server/api";
import { createSession, publicUser, verifyPassword } from "@/server/auth";
import { getDb } from "@/server/db";
import { rateLimit } from "@/server/rateLimit";

export async function POST(request: Request) {
  return safe(async () => {
    const body = await readJson(request);
    const email = text(body.email, "Email", 5, 254).toLowerCase();
    const password = text(body.password, "Password", 1, 128);
    rateLimit(`login:${email}`);
    const row = getDb().prepare("SELECT id,name,email,role,avatar,password_hash,status FROM users WHERE email=?").get(email);
    if (!row || row.status !== "active" || row.role !== "admin" || !verifyPassword(password, String(row.password_hash)))
      throw new ApiError(401, "INVALID_CREDENTIALS", "Email or password is incorrect.");
    await createSession(String(row.id));
    return publicUser(row);
  });
}
