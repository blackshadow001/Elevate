import { ApiError, json, readJson, safe } from "@/server/api";
import { requireSuperAdmin } from "@/server/auth";
import { getDb } from "@/server/db";
import { createTutorAccount } from "@/server/tutorProvisioning";

export async function POST(request: Request) {
  return safe(async () => {
    const actor = await requireSuperAdmin();
    return json(createTutorAccount(actor.id, await readJson(request)), 201);
  });
}

export async function GET(request: Request) {
  return safe(async () => {
    await requireSuperAdmin();
    const params = new URL(request.url).searchParams;
    const search = (params.get("search") || "").trim();
    const role = params.get("role") || "";
    const status = params.get("status") || "";
    const page = Number(params.get("page") || 1);
    const pageSize = Number(params.get("pageSize") || 25);
    if (search.length > 100 || !["", "learner", "instructor", "admin"].includes(role) ||
      !["", "active", "disabled"].includes(status) || !Number.isInteger(page) || page < 1 || page > 100000 ||
      !Number.isInteger(pageSize) || pageSize < 1 || pageSize > 100)
      throw new ApiError(422, "INVALID_FILTER", "Invalid user directory filter.");
    const where = ["1=1"];
    const values: Array<string | number> = [];
    if (search) {
      where.push("(name LIKE ? ESCAPE '\\' OR email LIKE ? ESCAPE '\\' OR id LIKE ? ESCAPE '\\')");
      const query = `%${search.replace(/[\\%_]/g, "\\$&")}%`;
      values.push(query, query, query);
    }
    if (role) { where.push("role=?"); values.push(role); }
    if (status) { where.push("status=?"); values.push(status); }
    const clause = where.join(" AND ");
    const db = getDb();
    const total = Number(db.prepare(`SELECT COUNT(*) n FROM users WHERE ${clause}`).get(...values)?.n || 0);
    const items = db.prepare(`SELECT id,name,email,role,status,avatar,created_at,is_super_admin FROM users
      WHERE ${clause} ORDER BY created_at DESC,id LIMIT ? OFFSET ?`).all(...values, pageSize, (page - 1) * pageSize)
      .map((row) => ({ id: String(row.id), name: String(row.name), email: String(row.email), role: String(row.role),
        status: String(row.status), avatar: row.avatar ? String(row.avatar) : null, createdAt: String(row.created_at),
        isSuperAdmin: Number(row.is_super_admin) === 1 }));
    return { items, total, page, pageSize };
  });
}
