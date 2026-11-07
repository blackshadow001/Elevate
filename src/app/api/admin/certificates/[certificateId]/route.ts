import { ApiError, id, readJson, safe } from "@/server/api";
import { requireRole } from "@/server/auth";
import { transaction } from "@/server/db";
import { recordAdminAction } from "@/server/adminAudit";
export async function PATCH(request: Request, { params }: { params: Promise<{ certificateId: string }> }) {
  return safe(async () => {
    const admin = await requireRole("admin");
    const certificateId = id((await params).certificateId);
    const body = await readJson(request);
    if (!["valid", "revoked"].includes(String(body.status))) throw new ApiError(422, "INVALID_STATUS", "Invalid certificate status.");
    return transaction((db) => {
      const row = db.prepare("SELECT verification_status FROM certificates WHERE id=?").get(certificateId);
      if (!row) throw new ApiError(404, "CERTIFICATE_NOT_FOUND", "Certificate not found.");
      if (row.verification_status === body.status) return { id: certificateId, status: String(body.status), changed: false };
      db.prepare("UPDATE certificates SET verification_status=? WHERE id=?").run(String(body.status), certificateId);
      recordAdminAction(db, { actorId: admin.id, action: body.status === "revoked" ? "certificate_revoked" : "certificate_restored",
        entityType: "certificate", entityId: certificateId,
        changes: { before: row.verification_status, after: body.status } });
      return { id: certificateId, status: String(body.status), changed: true };
    });
  });
}
