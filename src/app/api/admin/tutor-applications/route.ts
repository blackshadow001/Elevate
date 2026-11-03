import { ApiError, safe } from "@/server/api";
import { requireSuperAdmin } from "@/server/auth";
import { getDb } from "@/server/db";

export async function GET(request: Request) {
  return safe(async () => {
    await requireSuperAdmin();
    const status = new URL(request.url).searchParams.get("status") || "pending";
    if (!["pending", "approved", "rejected", "all"].includes(status)) throw new ApiError(422, "INVALID_FILTER", "Invalid status filter.");
    const rows = getDb().prepare(`SELECT a.id,a.user_id,a.subject,a.experience,a.course_plan,a.portfolio_url,a.status,
      a.admin_note,a.submitted_at,a.reviewed_at,u.name,u.email,u.role
      FROM tutor_applications a JOIN users u ON u.id=a.user_id
      ${status === "all" ? "" : "WHERE a.status=?"} ORDER BY a.submitted_at DESC LIMIT 200`)
      .all(...(status === "all" ? [] : [status]));
    return rows.map((row) => ({ id: row.id, userId: row.user_id, subject: row.subject,
      experience: row.experience, coursePlan: row.course_plan, portfolioUrl: row.portfolio_url,
      status: row.status, adminNote: row.admin_note, submittedAt: row.submitted_at, reviewedAt: row.reviewed_at,
      applicant: { name: row.name, email: row.email, role: row.role } }));
  });
}
