import "server-only";
import { requireAuth } from "@/server/auth";
import { getDb } from "@/server/db";
import { connectedGoogleAccount } from "@/server/googleAccounts";

export async function ownProfile() {
  const user = await requireAuth();
  const row = getDb().prepare("SELECT created_at FROM users WHERE id=?").get(user.id);
  return { ...user, createdAt: String(row?.created_at || ""), googleConnected: connectedGoogleAccount(user.id) };
}
