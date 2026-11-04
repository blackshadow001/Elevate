import { ApiError, readJson, safe } from "@/server/api";
import { requireRole } from "@/server/auth";
import { getDb, transaction } from "@/server/db";

export async function GET() {
  return safe(async () => {
    await requireRole("admin");
    const db = getDb();
    const row = db.prepare("SELECT monthly_price_minor,annual_price_minor,updated_at FROM personal_plan_settings WHERE id=1").get();
    const courses = db.prepare(`SELECT c.id,c.title,c.status,c.review_status,CASE WHEN p.course_id IS NULL THEN 0 ELSE 1 END selected
      FROM courses c LEFT JOIN personal_plan_courses p ON p.course_id=c.id
      WHERE c.status='published' AND c.review_status='approved' ORDER BY c.title COLLATE NOCASE,c.id`).all()
      .map((course) => ({ id: String(course.id), title: String(course.title), selected: Boolean(course.selected) }));
    return { monthlyPriceMinor: row?.monthly_price_minor ?? null, annualPriceMinor: row?.annual_price_minor ?? null,
      updatedAt: row?.updated_at ?? null, courses };
  });
}

export async function PUT(request: Request) {
  return safe(async () => {
    const admin = await requireRole("admin");
    const body = await readJson(request);
    const price = (value: unknown, field: string) => {
      if (value === null) return null;
      if (typeof value !== "number" || !Number.isSafeInteger(value) || value < 100 || value > 100_000_000)
        throw new ApiError(422, "INVALID_PRICE", `${field} must be a whole number of paise between ₹1 and ₹10,00,000, or blank.`);
      return value;
    };
    const monthly = price(body.monthlyPriceMinor, "Monthly price");
    const annual = price(body.annualPriceMinor, "Annual price");
    if (!Array.isArray(body.courseIds) || body.courseIds.length > 500 ||
      body.courseIds.some((value) => typeof value !== "string" || !/^[a-zA-Z0-9_-]{1,100}$/.test(value)) ||
      new Set(body.courseIds).size !== body.courseIds.length)
      throw new ApiError(422, "INVALID_COURSES", "Select up to 500 distinct published course IDs.");
    const courseIds = body.courseIds as string[];
    transaction((db) => {
      const published = db.prepare("SELECT 1 FROM courses WHERE id=? AND status='published' AND review_status='approved'");
      if (courseIds.some((courseId) => !published.get(courseId)))
        throw new ApiError(422, "INVALID_COURSES", "Personal Plan can include only published, approved courses.");
      db.prepare("UPDATE personal_plan_settings SET monthly_price_minor=?,annual_price_minor=?,updated_by=?,updated_at=? WHERE id=1")
        .run(monthly, annual, admin.id, new Date().toISOString());
      db.prepare("DELETE FROM personal_plan_courses").run();
      const insert = db.prepare("INSERT INTO personal_plan_courses(course_id,added_by) VALUES (?,?)");
      for (const courseId of courseIds) insert.run(courseId, admin.id);
    });
    return { monthlyPriceMinor: monthly, annualPriceMinor: annual, selectedCourseIds: courseIds };
  });
}
