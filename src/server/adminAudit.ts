import "server-only";
import { randomUUID } from "node:crypto";
import { getDb } from "@/server/db";

export function recordAdminAction(
  db: ReturnType<typeof getDb>,
  input: { actorId: string; action: string; entityType: "user" | "certificate" | "category"; entityId: string;
    reason?: string; changes?: Record<string, unknown> },
) {
  db.prepare(`INSERT INTO admin_audit_logs(id,actor_id,action,entity_type,entity_id,reason,change_json)
    VALUES (?,?,?,?,?,?,?)`).run(randomUUID(), input.actorId, input.action, input.entityType,
    input.entityId, input.reason || "", JSON.stringify(input.changes || {}));
}
