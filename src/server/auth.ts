import "server-only";
import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { ApiError } from "@/server/api";
import { getDb, transaction } from "@/server/db";
import { syncPersonalPlanAccess } from "@/server/personalPlan";

export type Role = "learner" | "instructor" | "admin";
export interface SessionUser { id: string; name: string; email: string; role: Role; avatar: string | null; isSuperAdmin?: boolean; }
const COOKIE = "learnly_session";
const SESSION_SECONDS = 60 * 60 * 24 * 7;

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  return `scrypt:${salt}:${scryptSync(password, salt, 64).toString("hex")}`;
}

export function verifyPassword(password: string, encoded: string): boolean {
  const [scheme, salt, hex] = encoded.split(":");
  if (scheme !== "scrypt" || !/^[a-f0-9]{32}$/.test(salt || "") || !/^[a-f0-9]{128}$/.test(hex || "")) return false;
  const actual = scryptSync(password, salt, 64);
  return timingSafeEqual(actual, Buffer.from(hex, "hex"));
}

export function publicUser(row: Record<string, unknown>): SessionUser {
  return { id: String(row.id), name: String(row.name), email: String(row.email), role: row.role as Role,
    avatar: row.avatar ? String(row.avatar) : null, isSuperAdmin: Number(row.is_super_admin || 0) === 1 };
}

export async function createSession(userId: string): Promise<void> {
  const token = randomBytes(32).toString("base64url");
  const expires = new Date(Date.now() + SESSION_SECONDS * 1000);
  transaction((db) => {
    db.prepare("UPDATE sessions SET revoked_at=? WHERE user_id=? AND revoked_at IS NULL")
      .run(new Date().toISOString(), userId);
    db.prepare("INSERT INTO sessions (id,user_id,token_hash,expires_at) VALUES (?,?,?,?)")
      .run(crypto.randomUUID(), userId, createHash("sha256").update(token).digest("hex"), expires.toISOString());
  });
  (await cookies()).set(COOKIE, token, {
    httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax",
    path: "/", expires,
  });
}

export async function revokeSession(): Promise<void> {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (token) getDb().prepare("UPDATE sessions SET revoked_at=? WHERE token_hash=?")
    .run(new Date().toISOString(), createHash("sha256").update(token).digest("hex"));
  store.delete(COOKIE);
}

export async function currentUser(): Promise<SessionUser | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  const row = getDb().prepare(`SELECT u.id,u.name,u.email,u.role,u.avatar,u.is_super_admin FROM sessions s
    JOIN users u ON u.id=s.user_id WHERE s.token_hash=? AND s.revoked_at IS NULL
    AND s.expires_at>? AND u.status='active'`).get(createHash("sha256").update(token).digest("hex"), new Date().toISOString());
  if (!row) return null;
  const user = publicUser(row);
  if (user.role === "learner") syncPersonalPlanAccess(user.id);
  return user;
}

export async function requireAuth(): Promise<SessionUser> {
  const user = await currentUser();
  if (!user) throw new ApiError(401, "UNAUTHENTICATED", "Sign in to continue.");
  return user;
}

export async function requireAnyRole(roles: Role[]): Promise<SessionUser> {
  const user = await requireAuth();
  if (!roles.includes(user.role)) throw new ApiError(403, "FORBIDDEN", "You do not have permission for this action.");
  return user;
}

export async function requireRole(role: Role): Promise<SessionUser> { return requireAnyRole([role]); }

export async function requireSuperAdmin(): Promise<SessionUser> {
  const user = await requireRole("admin");
  if (!user.isSuperAdmin) throw new ApiError(403, "SUPER_ADMIN_REQUIRED", "Only a super admin can manage administrator profiles and user accounts.");
  return user;
}
