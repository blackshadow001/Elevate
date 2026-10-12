import { ApiError, safe } from "@/server/api";
import { requireRole } from "@/server/auth";
import { getDb } from "@/server/db";

export async function GET(request: Request) {
  return safe(async () => {
    await requireRole("admin");
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "";
    const search = (searchParams.get("search") || "").trim();
    const page = Number(searchParams.get("page") || 1);
    if (!["", "pending", "paid", "cancelled", "refunded"].includes(status) || search.length > 100 ||
      !Number.isInteger(page) || page < 1 || page > 100000)
      throw new ApiError(422, "INVALID_FILTER", "Invalid order filter.");

    let query = `
      SELECT
        o.id,
        o.user_id,
        o.status,
        o.total_minor,
        o.currency,
        o.provider_reference,
        o.created_at,
        o.updated_at,
        u.name as user_name,
        u.email as user_email,
        c.id as course_id,
        GROUP_CONCAT(c.title, ', ') as course_title,
        inst.name as instructor_name,
        inst.id as instructor_id
      FROM orders o
      JOIN users u ON u.id = o.user_id
      LEFT JOIN order_items oi ON oi.order_id = o.id
      LEFT JOIN courses c ON c.id = oi.course_id
      LEFT JOIN users inst ON inst.id = c.instructor_id
    `;
    const params: string[] = [];

    const filters: string[] = [];
    if (status) { filters.push("o.status=?"); params.push(status); }
    if (search) {
      filters.push("(o.id LIKE ? ESCAPE '\\' OR u.name LIKE ? ESCAPE '\\' OR u.email LIKE ? ESCAPE '\\' OR c.title LIKE ? ESCAPE '\\')");
      const term = `%${search.replace(/[\\%_]/g, "\\$&")}%`;
      params.push(term, term, term, term);
    }
    const where = filters.length ? ` WHERE ${filters.join(" AND ")}` : "";
    query += `${where} GROUP BY o.id ORDER BY o.created_at DESC,o.id LIMIT 25 OFFSET ?`;

    const db = getDb();
    const total = Number(db.prepare(`SELECT COUNT(DISTINCT o.id) n FROM orders o JOIN users u ON u.id=o.user_id
      LEFT JOIN order_items oi ON oi.order_id=o.id LEFT JOIN courses c ON c.id=oi.course_id ${where}`).get(...params)?.n || 0);
    const rows = db.prepare(query).all(...params, (page - 1) * 25) as Array<{
      id: string;
      user_id: string;
      status: string;
      total_minor: number;
      currency: string;
      provider_reference: string | null;
      created_at: string;
      updated_at: string;
      user_name: string;
      user_email: string;
      course_id: string | null;
      course_title: string | null;
      instructor_name: string | null;
      instructor_id: string | null;
    }>;

    const summary = getDb().prepare(`
      SELECT
        COUNT(1) as total_count,
        COALESCE(SUM(CASE WHEN status='paid' THEN total_minor ELSE 0 END), 0) as paid_volume,
        COALESCE(SUM(CASE WHEN status='paid' THEN 1 ELSE 0 END), 0) as paid_count,
        COALESCE(SUM(CASE WHEN status='pending' THEN 1 ELSE 0 END), 0) as pending_count,
        COALESCE(SUM(CASE WHEN status='refunded' THEN 1 ELSE 0 END), 0) as refunded_count
      FROM orders
    `).get() as {
      total_count: number;
      paid_volume: number;
      paid_count: number;
      pending_count: number;
      refunded_count: number;
    };

    return {
      summary: {
        totalOrders: Number(summary.total_count || 0),
        paidVolumeMinor: Number(summary.paid_volume || 0),
        paidCount: Number(summary.paid_count || 0),
        pendingCount: Number(summary.pending_count || 0),
        refundedCount: Number(summary.refunded_count || 0),
      },
      pagination: { total, page, pageSize: 25 },
      orders: rows.map((r) => ({
        id: String(r.id),
        status: String(r.status),
        totalMinor: Number(r.total_minor),
        currency: String(r.currency),
        providerReference: r.provider_reference ? String(r.provider_reference) : null,
        createdAt: String(r.created_at),
        updatedAt: String(r.updated_at),
        user: {
          id: String(r.user_id),
          name: String(r.user_name),
          email: String(r.user_email),
        },
        course: r.course_id ? {
          id: String(r.course_id),
          title: String(r.course_title),
          instructorName: String(r.instructor_name || ""),
        } : null,
      })),
    };
  });
}
