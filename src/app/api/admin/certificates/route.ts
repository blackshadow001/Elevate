import { ApiError, safe } from "@/server/api";
import { requireRole } from "@/server/auth";
import { getDb } from "@/server/db";

export async function GET(request: Request) {
  return safe(async () => {
    await requireRole("admin");
    const params = new URL(request.url).searchParams;
    const search = (params.get("search") || "").trim();
    const status = params.get("status") || "";
    const page = Number(params.get("page") || 1);
    if (search.length > 100 || !["", "valid", "revoked"].includes(status) || !Number.isInteger(page) || page < 1 || page > 100000)
      throw new ApiError(422, "INVALID_FILTER", "Invalid certificate filter.");
    const where = ["1=1"];
    const values: Array<string | number> = [];
    if (search) {
      where.push("(c.certificate_number LIKE ? ESCAPE '\\' OR u.name LIKE ? ESCAPE '\\' OR co.title LIKE ? ESCAPE '\\')");
      const query = `%${search.replace(/[\\%_]/g, "\\$&")}%`;
      values.push(query, query, query);
    }
    if (status) { where.push("c.verification_status=?"); values.push(status); }
    const from = "certificates c JOIN users u ON u.id=c.user_id JOIN courses co ON co.id=c.course_id";
    const clause = where.join(" AND ");
    const db = getDb();
    const total = Number(db.prepare(`SELECT COUNT(*) n FROM ${from} WHERE ${clause}`).get(...values)?.n || 0);
    const items = db.prepare(`SELECT c.id,c.certificate_number,c.issued_at,c.verification_status,u.name learner_name,
      co.title course_title FROM ${from} WHERE ${clause} ORDER BY c.issued_at DESC,c.id LIMIT 25 OFFSET ?`)
      .all(...values, (page - 1) * 25);
    return { items, total, page, pageSize: 25 };
  });
}
