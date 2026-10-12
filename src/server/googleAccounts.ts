import "server-only";
import { randomBytes, randomUUID } from "node:crypto";
import { ApiError } from "@/server/api";
import { hashPassword, type SessionUser } from "@/server/auth";
import { getDb, transaction } from "@/server/db";

type GoogleIdentity = { subject: string; email: string; name: string; authoritativeEmail: boolean };

export function resolveGoogleAccount(identity: GoogleIdentity, intent: "login" | "link", current: SessionUser | null): string {
  return transaction((db) => {
    const linked = db.prepare("SELECT user_id FROM auth_identities WHERE provider='google' AND subject=?").get(identity.subject);
    if (linked) {
      const user = db.prepare("SELECT id,role,status FROM users WHERE id=?").get(String(linked.user_id));
      if (!user || user.status !== "active") throw new ApiError(403, "ACCOUNT_UNAVAILABLE", "This account is unavailable.");
      if (user.role === "admin") throw new ApiError(403, "ADMIN_PORTAL_REQUIRED", "Use the administrator portal to sign in.");
      if (intent === "link" && current?.id !== user.id) throw new ApiError(409, "GOOGLE_ALREADY_LINKED", "This Google account is linked to another account.");
      return String(user.id);
    }

    if (intent === "link") {
      if (!current || current.role === "admin") throw new ApiError(401, "LINK_LOGIN_REQUIRED", "Sign in with your password before connecting Google.");
      if (current.email.toLowerCase() !== identity.email) throw new ApiError(409, "EMAIL_MISMATCH", "Choose the Google account with the same email as your Elevate account.");
      const other = db.prepare("SELECT 1 FROM auth_identities WHERE provider='google' AND user_id=?").get(current.id);
      if (other) throw new ApiError(409, "GOOGLE_ALREADY_LINKED", "This account already has a connected Google login.");
      db.prepare("INSERT INTO auth_identities(provider,subject,user_id,email_at_link) VALUES('google',?,?,?)")
        .run(identity.subject, current.id, identity.email);
      return current.id;
    }

    const existing = db.prepare("SELECT id,role,status FROM users WHERE email=?").get(identity.email);
    if (existing) {
      if (existing.status !== "active") throw new ApiError(403, "ACCOUNT_UNAVAILABLE", "This account is unavailable.");
      if (existing.role === "admin") throw new ApiError(403, "ADMIN_PORTAL_REQUIRED", "Use the administrator portal to sign in.");
      if (!identity.authoritativeEmail) throw new ApiError(409, "LINK_LOGIN_REQUIRED", "Sign in with your password, then connect Google from the login page.");
      const other = db.prepare("SELECT 1 FROM auth_identities WHERE provider='google' AND user_id=?").get(String(existing.id));
      if (other) throw new ApiError(409, "GOOGLE_ALREADY_LINKED", "This account is connected to another Google login.");
      db.prepare("INSERT INTO auth_identities(provider,subject,user_id,email_at_link) VALUES('google',?,?,?)")
        .run(identity.subject, String(existing.id), identity.email);
      return String(existing.id);
    }

    const id = randomUUID();
    const name = identity.name.trim().slice(0, 160) || "Google user";
    db.prepare("INSERT INTO users(id,name,email,password_hash,role) VALUES(?,?,?,?,?)")
      .run(id, name.length >= 2 ? name : "Google user", identity.email,
        hashPassword(randomBytes(48).toString("base64url")), "learner");
    db.prepare("INSERT INTO auth_identities(provider,subject,user_id,email_at_link) VALUES('google',?,?,?)")
      .run(identity.subject, id, identity.email);
    return id;
  });
}

export function connectedGoogleAccount(userId: string): boolean {
  return Boolean(getDb().prepare("SELECT 1 FROM auth_identities WHERE provider='google' AND user_id=?").get(userId));
}
