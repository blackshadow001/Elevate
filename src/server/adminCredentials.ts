import "server-only";
import { randomBytes, randomUUID } from "node:crypto";
import { ApiError } from "@/server/api";
import { hashPassword, verifyPassword } from "@/server/auth";
import { getDb, transaction } from "@/server/db";
import { recordAdminAction } from "@/server/adminAudit";
import { rateLimit } from "@/server/rateLimit";

export function confirmSuperAdmin(db: ReturnType<typeof getDb>, actorId: string, currentPassword: unknown) {
  if (typeof currentPassword !== "string" || currentPassword.length < 1 || currentPassword.length > 128) {
    rateLimit(`admin-password:${actorId}`, 6);
    throw new ApiError(401, "INVALID_CREDENTIALS", "Current password is incorrect.");
  }
  const actor = db.prepare("SELECT password_hash FROM users WHERE id=? AND role='admin' AND is_super_admin=1 AND status='active'").get(actorId);
  if (!actor || !verifyPassword(currentPassword, String(actor.password_hash))) {
    rateLimit(`admin-password:${actorId}`, 6);
    throw new ApiError(401, "INVALID_CREDENTIALS", "Current password is incorrect.");
  }
}

export function listAdminProfiles() {
  return getDb().prepare(`SELECT u.id,u.name,u.email,u.status,u.is_super_admin,u.created_at,u.updated_at,
    (SELECT MAX(s.created_at) FROM sessions s WHERE s.user_id=u.id) last_session_at
    FROM users u WHERE u.role='admin' ORDER BY u.is_super_admin DESC,u.created_at DESC,u.id`).all()
    .map(row => ({ id: String(row.id), name: String(row.name), email: String(row.email),
      status: String(row.status), isSuperAdmin: Number(row.is_super_admin) === 1,
      createdAt: String(row.created_at), updatedAt: String(row.updated_at),
      lastSessionAt: row.last_session_at ? String(row.last_session_at) : null }));
}

export function createSubAdmin(actorId: string, body: Record<string, unknown>) {
  if (Object.keys(body).some(key => !["name", "email", "currentPassword"].includes(key)))
    throw new ApiError(422, "INVALID_INPUT", "Unsupported administrator field.");
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (name.length < 2 || name.length > 160 || email.length < 5 || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    throw new ApiError(422, "INVALID_INPUT", "Enter a valid name and email address.");
  return transaction(db => {
    confirmSuperAdmin(db, actorId, body.currentPassword);
    if (db.prepare("SELECT 1 FROM users WHERE email=?").get(email))
      throw new ApiError(409, "EMAIL_EXISTS", "An account with this email already exists.");
    const temporaryPassword = randomBytes(24).toString("base64url");
    const passwordHash = hashPassword(temporaryPassword);
    const id = randomUUID();
    try {
      db.prepare("INSERT INTO users(id,name,email,password_hash,role,is_super_admin) VALUES (?,?,?,?,'admin',0)")
        .run(id, name, email, passwordHash);
    } catch (error) {
      if (error instanceof Error && error.message.includes("UNIQUE"))
        throw new ApiError(409, "EMAIL_EXISTS", "An account with this email already exists.");
      throw error;
    }
    recordAdminAction(db, { actorId, action: "sub_admin_created", entityType: "user", entityId: id,
      changes: { role: "admin", isSuperAdmin: false, email } });
    return { profile: { id, name, email, status: "active", isSuperAdmin: false }, temporaryPassword };
  });
}

export function resetSubAdminPassword(actorId: string, targetId: string, body: Record<string, unknown>) {
  if (Object.keys(body).some(key => !["currentPassword"].includes(key)))
    throw new ApiError(422, "INVALID_INPUT", "Unsupported password reset field.");
  return transaction(db => {
    confirmSuperAdmin(db, actorId, body.currentPassword);
    const target = db.prepare("SELECT id,name,email,status,role,is_super_admin FROM users WHERE id=?").get(targetId);
    if (!target || target.role !== "admin") throw new ApiError(404, "ADMIN_NOT_FOUND", "Administrator profile not found.");
    if (Number(target.is_super_admin) === 1 || target.id === actorId)
      throw new ApiError(403, "SUPER_ADMIN_PROTECTED", "Use your own password-change form for the super admin account.");
    if (target.status !== "active") throw new ApiError(409, "ACCOUNT_DISABLED", "Activate this account before resetting its password.");
    const temporaryPassword = randomBytes(24).toString("base64url");
    const passwordHash = hashPassword(temporaryPassword);
    const now = new Date().toISOString();
    db.prepare("UPDATE users SET password_hash=?,updated_at=? WHERE id=?").run(passwordHash, now, targetId);
    db.prepare("UPDATE sessions SET revoked_at=? WHERE user_id=? AND revoked_at IS NULL").run(now, targetId);
    recordAdminAction(db, { actorId, action: "sub_admin_password_reset", entityType: "user", entityId: targetId,
      changes: { sessionsRevoked: true } });
    return { profile: { id: targetId, name: String(target.name), email: String(target.email) }, temporaryPassword };
  });
}

export function changeOwnSuperPassword(actorId: string, body: Record<string, unknown>) {
  if (Object.keys(body).some(key => !["currentPassword", "newPassword"].includes(key)))
    throw new ApiError(422, "INVALID_INPUT", "Unsupported password-change field.");
  const next = body.newPassword;
  if (typeof next !== "string" || next.length < 8 || next.length > 128 ||
    !/[a-z]/.test(next) || !/[A-Z]/.test(next) || !/[0-9]/.test(next) || !/[^a-zA-Z0-9]/.test(next))
    throw new ApiError(422, "WEAK_PASSWORD", "Use 8–128 characters with upper and lower case letters, a number, and a symbol.");
  if (next === body.currentPassword) throw new ApiError(422, "PASSWORD_REUSED", "Choose a different password.");
  transaction(db => {
    confirmSuperAdmin(db, actorId, body.currentPassword);
    const passwordHash = hashPassword(next);
    const now = new Date().toISOString();
    db.prepare("UPDATE users SET password_hash=?,updated_at=? WHERE id=?").run(passwordHash, now, actorId);
    db.prepare("UPDATE sessions SET revoked_at=? WHERE user_id=? AND revoked_at IS NULL").run(now, actorId);
    recordAdminAction(db, { actorId, action: "super_admin_password_changed", entityType: "user", entityId: actorId,
      reason: "Self-service password change", changes: { sessionsRevoked: true } });
  });
  return { changed: true, sessionsRevoked: true };
}
