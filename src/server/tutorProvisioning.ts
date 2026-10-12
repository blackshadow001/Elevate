import "server-only";
import { randomBytes, randomUUID } from "node:crypto";
import { ApiError } from "@/server/api";
import { confirmSuperAdmin } from "@/server/adminCredentials";
import { recordAdminAction } from "@/server/adminAudit";
import { hashPassword } from "@/server/auth";
import { transaction } from "@/server/db";

export function createTutorAccount(actorId: string, body: Record<string, unknown>) {
  if (Object.keys(body).some(key => !["name", "email", "currentPassword", "reason"].includes(key)))
    throw new ApiError(422, "INVALID_INPUT", "Unsupported tutor account field.");
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const reason = typeof body.reason === "string" ? body.reason.trim() : "";
  if (name.length < 2 || name.length > 160 || email.length < 5 || email.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    throw new ApiError(422, "INVALID_INPUT", "Enter a valid tutor name and email address.");
  if (reason.length < 3 || reason.length > 500)
    throw new ApiError(422, "REASON_REQUIRED", "Enter a reason of 3–500 characters.");

  return transaction(db => {
    confirmSuperAdmin(db, actorId, body.currentPassword);
    if (db.prepare("SELECT 1 FROM users WHERE email=?").get(email))
      throw new ApiError(409, "EMAIL_EXISTS", "An account with this email already exists.");
    const temporaryPassword = randomBytes(24).toString("base64url");
    const id = randomUUID();
    try {
      db.prepare("INSERT INTO users(id,name,email,password_hash,role,is_super_admin) VALUES (?,?,?,?,'instructor',0)")
        .run(id, name, email, hashPassword(temporaryPassword));
    } catch (error) {
      if (error instanceof Error && error.message.includes("UNIQUE"))
        throw new ApiError(409, "EMAIL_EXISTS", "An account with this email already exists.");
      throw error;
    }
    recordAdminAction(db, { actorId, action: "tutor_created", entityType: "user", entityId: id,
      reason, changes: { role: "instructor", email } });
    return { user: { id, name, email, role: "instructor", status: "active" }, temporaryPassword };
  });
}
