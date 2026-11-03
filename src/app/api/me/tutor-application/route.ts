import { randomUUID } from "node:crypto";
import { ApiError, json, readJson, safe, text } from "@/server/api";
import { requireAuth } from "@/server/auth";
import { getDb, transaction } from "@/server/db";

export async function GET() {
  return safe(async () => {
    const user = await requireAuth();
    const row = getDb().prepare(`SELECT id,subject,experience,course_plan,portfolio_url,status,admin_note,submitted_at,reviewed_at
      FROM tutor_applications WHERE user_id=?`).get(user.id);
    return row ? { id: row.id, subject: row.subject, experience: row.experience, coursePlan: row.course_plan,
      portfolioUrl: row.portfolio_url, status: row.status, adminNote: row.admin_note,
      submittedAt: row.submitted_at, reviewedAt: row.reviewed_at } : null;
  });
}

export async function POST(request: Request) {
  return safe(async () => {
    const user = await requireAuth();
    if (user.role !== "learner") throw new ApiError(403, "LEARNER_REQUIRED", "Only learner accounts can apply to teach.");
    const body = await readJson(request);
    const subject = text(body.subject, "Teaching subject", 3, 120);
    const experience = text(body.experience, "Professional experience", 30, 3000);
    const coursePlan = text(body.coursePlan, "Course plan", 30, 3000);
    const portfolioUrl = body.portfolioUrl === undefined || body.portfolioUrl === "" ? null : text(body.portfolioUrl, "Portfolio URL", 8, 500);
    if (portfolioUrl) {
      let url: URL;
      try { url = new URL(portfolioUrl); } catch { throw new ApiError(422, "INVALID_URL", "Use a valid HTTPS portfolio URL."); }
      if (url.protocol !== "https:" || url.username || url.password) throw new ApiError(422, "INVALID_URL", "Use a valid HTTPS portfolio URL.");
    }
    const result = transaction((db) => {
      const previous = db.prepare("SELECT id,status FROM tutor_applications WHERE user_id=?").get(user.id);
      if (previous && previous.status !== "rejected") throw new ApiError(409, "APPLICATION_EXISTS", "Your application is already being reviewed or approved.");
      const applicationId = previous ? String(previous.id) : randomUUID();
      if (previous) db.prepare(`UPDATE tutor_applications SET subject=?,experience=?,course_plan=?,portfolio_url=?,status='pending',
        admin_note=NULL,reviewed_by=NULL,reviewed_at=NULL,submitted_at=? WHERE id=?`)
        .run(subject, experience, coursePlan, portfolioUrl, new Date().toISOString(), applicationId);
      else db.prepare("INSERT INTO tutor_applications(id,user_id,subject,experience,course_plan,portfolio_url) VALUES (?,?,?,?,?,?)")
        .run(applicationId, user.id, subject, experience, coursePlan, portfolioUrl);
      return { id: applicationId, status: "pending" };
    });
    return json(result, 201);
  });
}
