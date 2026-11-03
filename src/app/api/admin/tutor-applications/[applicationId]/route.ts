import { randomUUID } from "node:crypto";
import { ApiError, id, readJson, safe, text } from "@/server/api";
import { requireSuperAdmin } from "@/server/auth";
import { getDb, transaction } from "@/server/db";
import { recordAdminAction } from "@/server/adminAudit";

export async function PATCH(request: Request, { params }: { params: Promise<{ applicationId: string }> }) {
  return safe(async () => {
    const admin = await requireSuperAdmin();
    const applicationId = id((await params).applicationId);
    const body = await readJson(request);
    if (body.action !== "approve" && body.action !== "reject") throw new ApiError(422, "INVALID_ACTION", "Choose approve or reject.");
    const note = text(body.note, "Review note", 3, 500);
    return transaction((db) => {
      const application = db.prepare(`SELECT a.user_id,a.status,u.role,u.status user_status FROM tutor_applications a
        JOIN users u ON u.id=a.user_id WHERE a.id=?`).get(applicationId);
      if (!application) throw new ApiError(404, "APPLICATION_NOT_FOUND", "Application not found.");
      if (application.status !== "pending") throw new ApiError(409, "ALREADY_REVIEWED", "This application has already been reviewed.");
      if (application.role !== "learner" || application.user_status !== "active") throw new ApiError(409, "ACCOUNT_CHANGED", "This learner account is no longer eligible for approval.");
      const applicantId = String(application.user_id);
      const status = body.action === "approve" ? "approved" : "rejected";
      const now = new Date().toISOString();
      db.prepare("UPDATE tutor_applications SET status=?,admin_note=?,reviewed_by=?,reviewed_at=? WHERE id=?")
        .run(status, note, admin.id, now, applicationId);
      if (status === "approved") {
        db.prepare("UPDATE users SET role='instructor',updated_at=? WHERE id=?").run(now, applicantId);
        db.prepare("UPDATE sessions SET revoked_at=? WHERE user_id=? AND revoked_at IS NULL").run(now, applicantId);
      }
      db.prepare("INSERT INTO notifications(id,user_id,type,title,message) VALUES (?,?,?,?,?)")
        .run(randomUUID(), applicantId, status === "approved" ? "success" : "info",
          status === "approved" ? "Tutor application approved" : "Tutor application reviewed",
          status === "approved" ? "Your tutor account is ready. Sign in again to open Instructor Studio." : "Your tutor application was not approved. Review the feedback and apply again if you wish.");
      recordAdminAction(db, { actorId: admin.id, action: `tutor_application_${status}`, entityType: "user",
        entityId: applicantId, reason: note, changes: { applicationId, status } });
      return { id: applicationId, status, userId: applicantId };
    });
  });
}
