import { ApiError, readJson, safe } from "@/server/api";
import { hashPassword, requireAuth, revokeSession, verifyPassword } from "@/server/auth";
import { recordAdminAction } from "@/server/adminAudit";
import { changeOwnSuperPassword } from "@/server/adminCredentials";
import { transaction } from "@/server/db";
import { rateLimit } from "@/server/rateLimit";

export async function POST(request: Request) {
  return safe(async () => {
    const user = await requireAuth();
    const body = await readJson(request);
    if (Object.keys(body).some((key) => !["currentPassword", "newPassword"].includes(key)))
      throw new ApiError(422, "INVALID_INPUT", "Unsupported password-change field.");
    if (typeof body.currentPassword !== "string" || !body.currentPassword || body.currentPassword.length > 128)
      throw new ApiError(422, "INVALID_INPUT", "Enter your current password.");
    if (typeof body.newPassword !== "string" || body.newPassword.length < 8 || body.newPassword.length > 128)
      throw new ApiError(422, "WEAK_PASSWORD", "Use a password of 8–128 characters.");
    if (user.role === "admin" && (!/[a-z]/.test(body.newPassword) || !/[A-Z]/.test(body.newPassword) ||
      !/[0-9]/.test(body.newPassword) || !/[^a-zA-Z0-9]/.test(body.newPassword)))
      throw new ApiError(422, "WEAK_PASSWORD", "Administrator passwords also need upper and lower case letters, a number, and a symbol.");
    if (body.newPassword === body.currentPassword)
      throw new ApiError(422, "PASSWORD_REUSED", "Choose a different password.");
    rateLimit(`profile-password:${user.id}`, 6);
    if (user.isSuperAdmin) {
      changeOwnSuperPassword(user.id, body);
      await revokeSession();
      return { changed: true, signedOut: true };
    }
    transaction((db) => {
      const row = db.prepare("SELECT password_hash FROM users WHERE id=? AND status='active'").get(user.id);
      if (!row || !verifyPassword(body.currentPassword as string, String(row.password_hash)))
        throw new ApiError(401, "INVALID_CREDENTIALS", "Current password is incorrect.");
      const now = new Date().toISOString();
      db.prepare("UPDATE users SET password_hash=?,updated_at=? WHERE id=?")
        .run(hashPassword(body.newPassword as string), now, user.id);
      db.prepare("UPDATE sessions SET revoked_at=? WHERE user_id=? AND revoked_at IS NULL")
        .run(now, user.id);
      if (user.role === "admin") recordAdminAction(db, { actorId: user.id, action: "admin_password_changed",
        entityType: "user", entityId: user.id, reason: "Self-service password change", changes: { sessionsRevoked: true } });
    });
    await revokeSession();
    return { changed: true, signedOut: true };
  });
}
