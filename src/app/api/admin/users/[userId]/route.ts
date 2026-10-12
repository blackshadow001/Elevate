import { ApiError, id, readJson, safe, text } from "@/server/api";
import { requireSuperAdmin } from "@/server/auth";
import { getDb, transaction } from "@/server/db";
import { recordAdminAction } from "@/server/adminAudit";
export async function GET(_request: Request, { params }: { params: Promise<{ userId: string }> }) {
  return safe(async () => {
    await requireSuperAdmin();
    const target = id((await params).userId);
    const db = getDb();
    const user = db.prepare("SELECT id,name,email,role,status,avatar,created_at,is_super_admin FROM users WHERE id=?").get(target);
    if (!user) throw new ApiError(404, "USER_NOT_FOUND", "User not found.");
    const courses = db.prepare(`SELECT id,title,slug,status,review_status,price_minor,updated_at FROM courses
      WHERE instructor_id=? ORDER BY updated_at DESC LIMIT 100`).all(target);
    const enrollments = db.prepare(`SELECT e.id,e.status,e.progress_percent,e.enrolled_at,e.completed_at,c.id course_id,c.title course_title
      FROM enrollments e JOIN courses c ON c.id=e.course_id WHERE e.user_id=? ORDER BY e.enrolled_at DESC LIMIT 100`).all(target);
    const certificates = db.prepare(`SELECT c.id,c.certificate_number,c.issued_at,c.verification_status,co.title course_title
      FROM certificates c JOIN courses co ON co.id=c.course_id WHERE c.user_id=? ORDER BY c.issued_at DESC LIMIT 100`).all(target);
    return { user: { id: user.id, name: user.name, email: user.email, role: user.role, status: user.status,
      avatar: user.avatar, createdAt: user.created_at, isSuperAdmin: Number(user.is_super_admin) === 1 },
      courses, enrollments, certificates };
  });
}
export async function PATCH(request: Request, { params }: { params: Promise<{ userId: string }> }) {
  return safe(async () => {
    const admin = await requireSuperAdmin();
    const target = id((await params).userId);
    if (admin.id === target) throw new ApiError(409, "SELF_CHANGE_DENIED", "You cannot change your own admin access here.");
    const body = await readJson(request);
    if (Object.keys(body).some((key) => !["role", "status", "reason"].includes(key)))
      throw new ApiError(422, "INVALID_INPUT", "Unsupported user-management field.");
    if (body.role === undefined && body.status === undefined) throw new ApiError(422, "NO_CHANGES", "Provide a role or status.");
    if ((body.role !== undefined && !["learner", "instructor", "admin"].includes(body.role as string)) ||
      (body.status !== undefined && !["active", "disabled"].includes(body.status as string))) {
      throw new ApiError(422, "INVALID_INPUT", "Invalid role or status.");
    }
    return transaction((db) => {
      const current = db.prepare("SELECT role,status,is_super_admin FROM users WHERE id=?").get(target);
      if (!current) throw new ApiError(404, "USER_NOT_FOUND", "User not found.");
      const role = body.role === undefined ? String(current.role) : String(body.role);
      const status = body.status === undefined ? String(current.status) : String(body.status);
      if (role === "admin" || current.role === "admin" || role !== current.role) {
        const actor = db.prepare("SELECT is_super_admin FROM users WHERE id=? AND status='active' AND role='admin'").get(admin.id);
        if (!actor?.is_super_admin) throw new ApiError(403, "SUPER_ADMIN_REQUIRED", "Only a super admin can change account roles or admin access.");
        if (current.is_super_admin) throw new ApiError(409, "SUPER_ADMIN_PROTECTED", "Super admin accounts cannot be changed through this endpoint.");
      }
      if (role === current.role && status === current.status) return { id: target, role, status, changed: false };
      const reason = text(body.reason, "Administrative reason", 3, 500);
      const now = new Date().toISOString();
      db.prepare("UPDATE users SET role=?,status=?,updated_at=? WHERE id=?")
        .run(role, status, now, target);
      db.prepare("UPDATE sessions SET revoked_at=? WHERE user_id=? AND revoked_at IS NULL")
        .run(now, target);
      recordAdminAction(db, { actorId: admin.id, action: role !== current.role ? "role_changed" : "status_changed",
        entityType: "user", entityId: target, reason,
        changes: { before: { role: current.role, status: current.status }, after: { role, status } } });
      return { id: target, role, status, changed: true };
    });
  });
}
