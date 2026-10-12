import { json, readJson, safe } from "@/server/api";
import { requireAnyRole } from "@/server/auth";
import { courseDto, createCourse } from "@/server/courses";
import { getDb } from "@/server/db";


export async function GET() {
  return safe(async () => {
    const user = await requireAnyRole(["instructor", "admin"]);
    const db = getDb();
    const rows = db.prepare(`SELECT c.*,u.name instructor_name,u.avatar instructor_avatar
      FROM courses c JOIN users u ON u.id=c.instructor_id ${user.role === "admin" ? "" : "WHERE c.instructor_id=?"}
      ORDER BY c.updated_at DESC`).all(...(user.role === "admin" ? [] : [user.id]));
    return rows.map(courseDto);
  });
}

export async function POST(request: Request) {
  return safe(async () => {
    const user = await requireAnyRole(["instructor", "admin"]);
    return json(createCourse(user, await readJson(request)), 201);
  });
}
